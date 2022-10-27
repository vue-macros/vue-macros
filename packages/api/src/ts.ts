import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { babelParse, getLang, resolveObjectKey } from '@vue-macros/common'
import { isDeclaration } from '@babel/types'

import type {
  Identifier,
  ImportSpecifier,
  Node,
  Statement,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSDeclareFunction,
  TSEnumDeclaration,
  TSInterfaceBody,
  TSInterfaceDeclaration,
  TSIntersectionType,
  TSMethodSignature,
  TSModuleDeclaration,
  TSParenthesizedType,
  TSPropertySignature,
  TSType,
  TSTypeAliasDeclaration,
  TSTypeElement,
  TSTypeLiteral,
} from '@babel/types'

export type TSDeclaration =
  /* TypeScript & Declaration */
  | TSDeclareFunction
  | TSInterfaceDeclaration
  | TSTypeAliasDeclaration
  | TSEnumDeclaration
  | TSModuleDeclaration

export interface TSFile {
  filePath: string
  content: string
  ast: Statement[]
}

export interface TSProperties {
  callSignatures: Array<{
    type: TSCallSignatureDeclaration
    file: TSFile
  }>
  constructSignatures: Array<{
    type: TSConstructSignatureDeclaration
    file: TSFile
  }>
  methods: Record<
    string | number,
    Array<{
      type: TSMethodSignature
      file: TSFile
    }>
  >
  properties: Record<
    string | number,
    {
      value: {
        type: TSType
        file: TSFile
      } | null
      optional: boolean
      signature: {
        type: TSPropertySignature
        file: TSFile
      }
    }
  >
}

export const tsFileCache: Record<string, TSFile> = {}
export async function getTSFile(filePath: string): Promise<TSFile> {
  if (tsFileCache[filePath]) return tsFileCache[filePath]
  const content = await readFile(filePath, 'utf-8')
  const program = babelParse(
    await readFile(filePath, 'utf-8'),
    getLang(filePath)
  )
  return (tsFileCache[filePath] = {
    filePath,
    content,
    ast: program.body,
  })
}

export const isTSDeclaration = (node: any): node is TSDeclaration =>
  isDeclaration(node) && node.type.startsWith('TS')

export function mergeTSProperties(
  a: TSProperties,
  b: TSProperties
): TSProperties {
  return {
    callSignatures: [...a.callSignatures, ...b.callSignatures],
    constructSignatures: [...a.constructSignatures, ...b.constructSignatures],
    methods: { ...a.methods, ...b.methods },
    properties: { ...a.properties, ...b.properties },
  }
}

/**
 * get properties of `interface` or `type` declaration
 *
 * @limitation don't support index signature
 */
export async function resolveTSProperties({
  type,
  file,
}: TSResolvedType<
  TSInterfaceDeclaration | TSInterfaceBody | TSTypeLiteral | TSIntersectionType
>): Promise<TSProperties> {
  if (type.type === 'TSInterfaceBody') {
    return resolveTypeElements(file, type.body)
  } else if (type.type === 'TSTypeLiteral') {
    return resolveTypeElements(file, type.members)
  } else if (type.type === 'TSInterfaceDeclaration') {
    let properties = resolveTypeElements(file, type.body.body)
    if (type.extends) {
      const resolvedExtends = (
        await Promise.all(
          type.extends.map((node) =>
            node.expression.type === 'Identifier'
              ? resolveTSReferencedType({
                  file,
                  type: node.expression,
                })
              : undefined
          )
        )
      )
        // eslint-disable-next-line unicorn/no-array-callback-reference
        .filter(filterValidExtends)

      if (resolvedExtends.length > 0) {
        const ext = (
          await Promise.all(
            resolvedExtends.map((resolved) => resolveTSProperties(resolved))
          )
        ).reduceRight((acc, curr) => mergeTSProperties(acc, curr))
        properties = mergeTSProperties(ext, properties)
      }
    }
    return properties
  } else if (type.type === 'TSIntersectionType') {
    let properties: TSProperties = {
      callSignatures: [],
      constructSignatures: [],
      methods: {},
      properties: {},
    }
    for (const subType of type.types) {
      const resolved = await resolveTSReferencedType({
        file,
        type: subType,
      })
      if (!filterValidExtends(resolved)) continue
      properties = mergeTSProperties(
        properties,
        await resolveTSProperties(resolved)
      )
    }
    return properties
  } else {
    throw new Error(`unknown node: ${(type as Node)?.type}`)
  }

  function filterValidExtends(
    node: TSResolvedType | undefined
  ): node is TSResolvedType<
    TSInterfaceDeclaration | TSTypeLiteral | TSIntersectionType
  > {
    return [
      'TSInterfaceDeclaration',
      'TSTypeLiteral',
      'TSIntersectionType',
    ].includes(node?.type.type as any)
  }
}

/**
 * @limitation don't support index signature
 */
export function resolveTypeElements(
  file: TSFile,
  elements: Array<TSTypeElement>
) {
  const properties: TSProperties = {
    callSignatures: [],
    constructSignatures: [],
    methods: {},
    properties: {},
  }

  const tryGetKey = (element: TSMethodSignature | TSPropertySignature) => {
    try {
      return resolveObjectKey(element.key, element.computed, false)
    } catch {}
  }

  for (const element of elements) {
    switch (element.type) {
      case 'TSCallSignatureDeclaration':
        properties.callSignatures.push({ file, type: element })
        break
      case 'TSConstructSignatureDeclaration':
        properties.constructSignatures.push({ file, type: element })
        break
      case 'TSMethodSignature': {
        const key = tryGetKey(element)
        if (!key) continue

        // cannot overwrite if already exists
        if (properties.properties[key]) continue

        if (!properties.methods[key]) properties.methods[key] = []
        if (element.typeAnnotation) {
          properties.methods[key].push({ file, type: element })
        }
        break
      }
      case 'TSPropertySignature': {
        const key = tryGetKey(element)
        if (!key) continue

        if (!properties.properties[key] && !properties.methods[key]) {
          // cannot be override
          const type = element.typeAnnotation?.typeAnnotation
          properties.properties[key] = {
            value: type ? { type, file } : null,
            optional: !!element.optional,
            signature: { type: element, file },
          }
        }
        break
      }
      case 'TSIndexSignature':
        // TODO: unsupported
        break
    }
  }

  return properties
}

export interface TSResolvedType<
  T =
    | Exclude<TSType, TSParenthesizedType>
    | Exclude<TSDeclaration, TSTypeAliasDeclaration>
> {
  file: TSFile
  type: T
}

/**
 * Resolve a reference to a type.
 *
 * Supports `type` and `interface` only.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 */
export async function resolveTSReferencedType(
  ref: TSResolvedType<TSType | Identifier | TSDeclaration>,
  stacks: TSResolvedType<any>[] = []
): Promise<TSResolvedType | undefined> {
  const { file, type } = ref
  if (stacks.some((stack) => stack.file === file && stack.type === type)) {
    return ref as any
  }
  stacks.push(ref)

  if (
    type.type === 'TSTypeAliasDeclaration' ||
    type.type === 'TSParenthesizedType'
  ) {
    return resolveTSReferencedType({ file, type: type.typeAnnotation }, stacks)
  }

  let refName: string
  if (type.type === 'Identifier') {
    refName = type.name
  } else if (type.type === 'TSTypeReference') {
    if (type.typeName.type !== 'Identifier') return undefined
    refName = type.typeName.name
  } else {
    return { file, type }
  }

  for (let node of file.ast) {
    if (node.type === 'ImportDeclaration') {
      const resolved = await resolveTSFileId(node.source.value, file.filePath)
      if (!resolved) continue
      const specifier = node.specifiers.find(
        (specifier): specifier is ImportSpecifier =>
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === refName
      )
      if (!specifier) continue
      const exports = await resolveTSFileExports(await getTSFile(resolved))
      return exports[specifier.local.name]
    }

    if (node.type === 'ExportNamedDeclaration' && node.declaration)
      node = node.declaration

    if (isTSDeclaration(node)) {
      if (node.id?.type !== 'Identifier') continue
      if (node.id.name !== refName) continue
      return resolveTSReferencedType({ file, type: node }, stacks)
    }
  }

  if (type.type === 'TSTypeReference') return { file, type }
}

export type TSFileExports = Record<string, TSResolvedType | undefined>
export const tsFileExportsCache: Map<TSFile, TSFileExports> = new Map()

/**
 * Get exports of the TS file.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 * @limitation don't support `export default`, since TS don't support it currently.
 * @limitation don't support `export * as xxx from '...'` (aka namespace).
 */
export async function resolveTSFileExports(
  file: TSFile
): Promise<TSFileExports> {
  if (tsFileExportsCache.has(file)) return tsFileExportsCache.get(file)!

  const exports: TSFileExports = {}
  tsFileExportsCache.set(file, exports)

  for (const stmt of file.ast) {
    if (stmt.type === 'ExportDefaultDeclaration') {
      // TS don't support it.
    } else if (stmt.type === 'ExportAllDeclaration') {
      const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
      if (!resolved) continue
      const sourceExports = await resolveTSFileExports(
        await getTSFile(resolved)
      )
      Object.assign(exports, sourceExports)
    } else if (stmt.type === 'ExportNamedDeclaration') {
      let sourceExports: Awaited<ReturnType<typeof resolveTSFileExports>>
      if (stmt.source) {
        const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
        if (!resolved) continue
        sourceExports = await resolveTSFileExports(await getTSFile(resolved))
      }

      for (const specifier of stmt.specifiers) {
        if (
          specifier.type === 'ExportDefaultSpecifier' ||
          specifier.type === 'ExportNamespaceSpecifier'
        ) {
          // default export: TS don't support it.
          // TODO: namespace: doesn't support it yet.
          continue
        }

        const exportedName =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : specifier.exported.value

        if (stmt.source) {
          exports[exportedName] = sourceExports![specifier.local.name]
        } else {
          exports[exportedName] = await resolveTSReferencedType({
            file,
            type: specifier.local,
          })
        }
      }

      if (isTSDeclaration(stmt.declaration)) {
        const decl = stmt.declaration
        if (decl.id?.type === 'Identifier') {
          const exportedName = decl.id.name
          exports[exportedName] = await resolveTSReferencedType({
            file,
            type: decl,
          })
        }
      }
    }
  }

  return exports
}

export type ResolveTSFileIdImpl = (
  id: string,
  importer: string
) => Promise<string | undefined> | string | undefined
let resolveTSFileIdImpl: ResolveTSFileIdImpl = resolveTSFileIdNode
export function resolveTSFileId(id: string, importer: string) {
  return resolveTSFileIdImpl(id, importer)
}

/**
 * @limitation don't node_modules and JavaScript file
 */
export function resolveTSFileIdNode(id: string, importer: string) {
  function tryResolve(id: string, importer: string) {
    const filePath = path.resolve(importer, '..', id)
    if (!existsSync(filePath)) return
    return filePath
  }
  return (
    tryResolve(id, importer) ||
    tryResolve(`${id}.ts`, importer) ||
    tryResolve(`${id}/index`, importer) ||
    tryResolve(`${id}/index.ts`, importer)
  )
}

export function setResolveTSFileIdImpl(impl: ResolveTSFileIdImpl) {
  resolveTSFileIdImpl = impl
}
