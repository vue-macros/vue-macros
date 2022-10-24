import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { babelParse, getLang, getStaticKey } from '@vue-macros/common'
import { isDeclaration } from '@babel/types'

import type {
  Declaration,
  Identifier,
  ImportSpecifier,
  Node,
  Statement,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSInterfaceDeclaration,
  TSMethodSignature,
  TSParenthesizedType,
  TSPropertySignature,
  TSType,
  TSTypeAliasDeclaration,
  TSTypeElement,
  TSTypeLiteral,
  TSTypeReference,
  TypeScript,
} from '@babel/types'

export type TSDeclaration = TypeScript & Declaration
export interface TSFile {
  filePath: string
  content: string
  ast: Statement[]
}

export interface TSProperties {
  callSignatures: TSCallSignatureDeclaration[]
  constructSignatures: TSConstructSignatureDeclaration[]
  methods: Record<string | number, Array<TSMethodSignature>>
  properties: Record<
    string | number,
    { value: TSType | null; optional: boolean; signature: TSPropertySignature }
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
export async function resolveTSProperties(
  file: TSFile,
  node: TSInterfaceDeclaration | TSTypeLiteral
) {
  let properties: TSProperties = {
    callSignatures: [],
    constructSignatures: [],
    methods: {},
    properties: {},
  }
  if (node.type === 'TSInterfaceDeclaration') {
    resolveTypeElements(properties, node.body.body)
    if (node.extends) {
      const newLocal = await Promise.all(
        node.extends.map((node) =>
          node.expression.type === 'Identifier'
            ? resolveTSReferencedType(file, node.expression)
            : undefined
        )
      )
      const ext = (
        await Promise.all(
          newLocal
            .filter((node): node is TSInterfaceDeclaration | TSTypeLiteral =>
              ['TSInterfaceDeclaration', 'TSTypeLiteral'].includes(
                node?.type as any
              )
            )
            .map((node) => resolveTSProperties(file, node))
        )
      ).reduceRight((acc, curr) => mergeTSProperties(acc, curr))
      properties = mergeTSProperties(ext, properties)
    }
  } else if (node.type === 'TSTypeLiteral') {
    resolveTypeElements(properties, node.members)
  } else {
    throw new Error(`unknown node: ${(node as Node)?.type}`)
  }
  return properties
}

/**
 * @limitation don't support index signature
 */
export function resolveTypeElements(
  properties: TSProperties,
  elements: Array<TSTypeElement>
) {
  const tryGetKey = (element: TSMethodSignature | TSPropertySignature) => {
    try {
      return getStaticKey(element.key, element.computed, false)
    } catch {}
  }

  for (const element of elements) {
    switch (element.type) {
      case 'TSCallSignatureDeclaration':
        properties.callSignatures.push(element)
        break
      case 'TSConstructSignatureDeclaration':
        properties.constructSignatures.push(element)
        break
      case 'TSMethodSignature': {
        const key = tryGetKey(element)
        if (!key) continue

        // cannot overwrite if already exists
        if (properties.properties[key]) continue

        if (!properties.methods[key]) properties.methods[key] = []
        if (element.typeAnnotation) {
          properties.methods[key].push(element)
        }
        break
      }
      case 'TSPropertySignature': {
        const key = tryGetKey(element)
        if (!key) continue

        if (!properties.properties[key] && !properties.methods[key])
          // cannot be override
          properties.properties[key] = {
            value: element.typeAnnotation?.typeAnnotation ?? null,
            optional: !!element.optional,
            signature: element,
          }
        break
      }
      case 'TSIndexSignature':
        // TODO: unsupported
        break
    }
  }
}

export type TSResolvedType =
  | Exclude<TSType, TSTypeReference | TSParenthesizedType>
  | Exclude<TSDeclaration, TSTypeAliasDeclaration>
  | undefined

/**
 * Resolve a reference to a type.
 *
 * Supports `type` and `interface` only.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 */
export async function resolveTSReferencedType(
  file: TSFile,
  ref: TSType | Identifier | TSDeclaration
): Promise<TSResolvedType> {
  if (
    ref.type === 'TSTypeAliasDeclaration' ||
    ref.type === 'TSParenthesizedType'
  ) {
    return resolveTSReferencedType(file, ref.typeAnnotation)
  }

  let refName: string
  if (ref.type === 'Identifier') {
    refName = ref.name
  } else if (ref.type === 'TSTypeReference') {
    if (ref.typeName.type !== 'Identifier') return undefined
    refName = ref.typeName.name
  } else {
    return ref
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
      return resolveTSReferencedType(file, node)
    }
  }
}

export type TSFileExports = Record<string, TSResolvedType>
export const tsFileExportsCache: Map<TSFile, TSFileExports> = new Map()

/**
 * Get exports of the TS file.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 * @limitation don't support `export default`, since TS don't support it currently.
 * @limitation don't support `export * as xxx from '...'` (aka namespace).
 */
export async function resolveTSFileExports(file: TSFile) {
  if (tsFileExportsCache.has(file)) return tsFileExportsCache.get(file)!

  const exports: Record<
    string,
    Awaited<ReturnType<typeof resolveTSReferencedType>>
  > = {}
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
          // TODO: namespace: we don't support it.
          continue
        }

        const exportedName =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : specifier.exported.value

        if (stmt.source) {
          exports[exportedName] = sourceExports![specifier.local.name]
        } else {
          exports[exportedName] = await resolveTSReferencedType(
            file,
            specifier.local
          )
        }
      }

      if (isTSDeclaration(stmt.declaration)) {
        const decl = stmt.declaration
        if (decl.id?.type === 'Identifier') {
          const exportedName = decl.id.name
          exports[exportedName] = await resolveTSReferencedType(file, decl)
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
