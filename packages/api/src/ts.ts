import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import {
  babelParse,
  getFileCodeAndLang,
  isStaticExpression,
  resolveLiteral,
  resolveObjectKey,
} from '@vue-macros/common'
import { isDeclaration } from '@babel/types'

import {
  type Identifier,
  type ImportNamespaceSpecifier,
  type ImportSpecifier,
  type Statement,
  type TSCallSignatureDeclaration,
  type TSConstructSignatureDeclaration,
  type TSDeclareFunction,
  type TSEntityName,
  type TSEnumDeclaration,
  type TSFunctionType,
  type TSInterfaceBody,
  type TSInterfaceDeclaration,
  type TSIntersectionType,
  type TSMappedType,
  type TSMethodSignature,
  type TSModuleBlock,
  type TSModuleDeclaration,
  type TSParenthesizedType,
  type TSPropertySignature,
  type TSType,
  type TSTypeAliasDeclaration,
  type TSTypeElement,
  type TSTypeLiteral,
  type UnaryExpression,
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

export type TSScope = TSFile | TSResolvedType<TSModuleBlock>

export interface TSProperties {
  callSignatures: Array<
    TSResolvedType<TSCallSignatureDeclaration | TSFunctionType>
  >
  constructSignatures: Array<TSResolvedType<TSConstructSignatureDeclaration>>
  methods: Record<string | number, Array<TSResolvedType<TSMethodSignature>>>
  properties: Record<
    string | number,
    {
      value: TSResolvedType<TSType> | null
      optional: boolean
      signature: TSResolvedType<TSPropertySignature | TSMappedType>
    }
  >
}

export const tsFileCache: Record<string, TSFile> = {}
export async function getTSFile(filePath: string): Promise<TSFile> {
  if (tsFileCache[filePath]) return tsFileCache[filePath]
  const content = await readFile(filePath, 'utf-8')
  const { code, lang } = getFileCodeAndLang(content, filePath)
  const program = babelParse(code, lang)
  return (tsFileCache[filePath] = {
    filePath,
    content,
    ast: program.body,
  })
}

export function isTSDeclaration(node: any): node is TSDeclaration {
  return isDeclaration(node) && node.type.startsWith('TS')
}

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
  scope,
}: TSResolvedType<
  | TSInterfaceDeclaration
  | TSInterfaceBody
  | TSTypeLiteral
  | TSIntersectionType
  | TSMappedType
  | TSFunctionType
>): Promise<TSProperties> {
  switch (type.type) {
    case 'TSInterfaceBody':
      return resolveTypeElements(scope, type.body)
    case 'TSTypeLiteral':
      return resolveTypeElements(scope, type.members)
    case 'TSInterfaceDeclaration': {
      let properties = resolveTypeElements(scope, type.body.body)
      if (type.extends) {
        const resolvedExtends = (
          await Promise.all(
            type.extends.map((node) =>
              node.expression.type === 'Identifier'
                ? resolveTSReferencedType({
                    scope,
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
    }
    case 'TSIntersectionType': {
      let properties: TSProperties = {
        callSignatures: [],
        constructSignatures: [],
        methods: {},
        properties: {},
      }
      for (const subType of type.types) {
        const resolved = await resolveTSReferencedType({
          scope,
          type: subType,
        })
        if (!filterValidExtends(resolved)) continue
        properties = mergeTSProperties(
          properties,
          await resolveTSProperties(resolved)
        )
      }
      return properties
    }
    case 'TSMappedType': {
      const properties: TSProperties = {
        callSignatures: [],
        constructSignatures: [],
        methods: {},
        properties: {},
      }
      if (!type.typeParameter.constraint) return properties

      const constraint = await resolveTSReferencedType({
        type: type.typeParameter.constraint,
        scope,
      })
      if (!constraint?.type) return properties

      const types =
        constraint.type.type === 'TSUnionType'
          ? constraint.type.types
          : [constraint.type]

      for (const subType of types) {
        if (subType.type !== 'TSLiteralType') continue
        const literal = subType.literal
        if (!isStaticExpression(literal)) continue
        const key = resolveLiteral(
          literal as Exclude<typeof literal, UnaryExpression>
        )
        if (!key) continue
        properties.properties[String(key)] = {
          value: type.typeAnnotation
            ? { scope, type: type.typeAnnotation }
            : null,
          optional: type.optional === '+' || type.optional === true,
          signature: { type, scope },
        }
      }

      return properties
    }
    case 'TSFunctionType': {
      const properties: TSProperties = {
        callSignatures: [{ type, scope }],
        constructSignatures: [],
        methods: {},
        properties: {},
      }
      return properties
    }
    default:
      // @ts-expect-error type is never
      throw new Error(`unknown node: ${type?.type}`)
  }

  function filterValidExtends(
    node: TSResolvedType | TSExports | undefined
  ): node is TSResolvedType<
    TSInterfaceDeclaration | TSTypeLiteral | TSIntersectionType
  > {
    return (
      !isTSExports(node) &&
      [
        'TSInterfaceDeclaration',
        'TSTypeLiteral',
        'TSIntersectionType',
      ].includes(node?.type.type as any)
    )
  }
}

/**
 * @limitation don't support index signature
 */
export function resolveTypeElements(
  scope: TSScope,
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
        properties.callSignatures.push({ scope, type: element })
        break
      case 'TSConstructSignatureDeclaration':
        properties.constructSignatures.push({ scope, type: element })
        break
      case 'TSMethodSignature': {
        const key = tryGetKey(element)
        if (!key) continue

        // cannot overwrite if already exists
        if (properties.properties[key]) continue

        if (!properties.methods[key]) properties.methods[key] = []
        if (element.typeAnnotation) {
          properties.methods[key].push({ scope, type: element })
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
            value: type ? { type, scope } : null,
            optional: !!element.optional,
            signature: { type: element, scope },
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
  scope: TSScope
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
): Promise<TSResolvedType | TSExports | undefined> {
  const { scope, type } = ref
  if (stacks.some((stack) => stack.scope === scope && stack.type === type)) {
    return ref as any
  }
  stacks.push(ref)

  if (
    type.type === 'TSTypeAliasDeclaration' ||
    type.type === 'TSParenthesizedType'
  ) {
    return resolveTSReferencedType({ scope, type: type.typeAnnotation }, stacks)
  }

  let refNames: string[]
  if (type.type === 'Identifier') {
    refNames = [type.name]
  } else if (type.type === 'TSTypeReference') {
    if (type.typeName.type === 'Identifier') {
      refNames = [type.typeName.name]
    } else {
      refNames = resolveTSEntityName(type.typeName).map((id) => id.name)
    }
  } else if (
    type.type === 'TSModuleDeclaration' &&
    type.body.type === 'TSModuleBlock'
  ) {
    return resolveTSExports({ type: type.body, scope })
  } else {
    return { scope, type }
  }
  const [refName, ...restNames] = refNames

  const { body, file } = resolveTSScope(scope)
  for (let node of body) {
    if (node.type === 'ImportDeclaration') {
      const specifier = node.specifiers.find(
        (specifier): specifier is ImportSpecifier | ImportNamespaceSpecifier =>
          (specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === refName) ||
          (specifier.type === 'ImportNamespaceSpecifier' &&
            specifier.local.name === refName)
      )
      if (!specifier) continue

      const resolved = await resolveTSFileId(node.source.value, file.filePath)
      if (!resolved) continue
      const exports = await resolveTSExports(await getTSFile(resolved))

      let type: any = exports
      for (const name of specifier.type === 'ImportSpecifier'
        ? refNames
        : restNames) {
        type = type?.[name]
      }
      return type
    }

    if (node.type === 'ExportNamedDeclaration' && node.declaration)
      node = node.declaration

    if (isTSDeclaration(node)) {
      if (node.id?.type !== 'Identifier') continue
      if (node.id.name !== refName) continue
      const resolved = await resolveTSReferencedType(
        { scope, type: node },
        stacks
      )
      if (!resolved) return

      if (restNames.length === 0) {
        return resolved
      } else {
        let exports: any = resolved
        for (const name of restNames) {
          exports = exports[name]
        }
        return exports as TSResolvedType
      }
    }
  }

  if (type.type === 'TSTypeReference') return { scope, type }
}

export function resolveTSScope(scope: TSScope): {
  isFile: boolean
  file: TSFile
  body: Statement[]
} {
  const isFile = 'ast' in scope
  const file = isFile ? scope : resolveTSScope(scope.scope).file
  const body = isFile ? scope.ast : scope.type.body

  return {
    isFile,
    file,
    body,
  }
}

export function resolveTSEntityName(node: TSEntityName): Identifier[] {
  if (node.type === 'Identifier') return [node]
  else {
    return [...resolveTSEntityName(node.left), node.right]
  }
}

export const exportsSymbol = Symbol('exports')
export type TSExports = {
  [K in string]: TSResolvedType | TSExports | undefined
} & { [exportsSymbol]: true }
export const tsFileExportsCache: Map<TSScope, TSExports> = new Map()

export function isTSExports(val: unknown): val is TSExports {
  return !!val && typeof val === 'object' && exportsSymbol in val
}

/**
 * Get exports of the TS file.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 * @limitation don't support `export default`, since TS don't support it currently.
 * @limitation don't support `export * as xxx from '...'` (aka namespace).
 */
export async function resolveTSExports(scope: TSScope): Promise<TSExports> {
  if (tsFileExportsCache.has(scope)) return tsFileExportsCache.get(scope)!

  const exports: TSExports = {
    [exportsSymbol]: true,
  }
  tsFileExportsCache.set(scope, exports)

  const { body, file } = resolveTSScope(scope)
  for (const stmt of body) {
    if (stmt.type === 'ExportDefaultDeclaration') {
      // TS don't support it.
    } else if (stmt.type === 'ExportAllDeclaration') {
      const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
      if (!resolved) continue
      const sourceExports = await resolveTSExports(await getTSFile(resolved))
      Object.assign(exports, sourceExports)
    } else if (stmt.type === 'ExportNamedDeclaration') {
      let sourceExports: Awaited<ReturnType<typeof resolveTSExports>>
      if (stmt.source) {
        const resolved = await resolveTSFileId(stmt.source.value, file.filePath)
        if (!resolved) continue
        sourceExports = await resolveTSExports(await getTSFile(resolved))
      }

      for (const specifier of stmt.specifiers) {
        if (specifier.type === 'ExportDefaultSpecifier') {
          // default export: TS don't support it.
          continue
        }

        if (specifier.type === 'ExportNamespaceSpecifier') {
          exports[specifier.exported.name] = sourceExports!
        } else {
          const exportedName =
            specifier.exported.type === 'Identifier'
              ? specifier.exported.name
              : specifier.exported.value

          if (stmt.source) {
            exports[exportedName] = sourceExports![specifier.local.name]
          } else {
            exports[exportedName] = await resolveTSReferencedType({
              scope,
              type: specifier.local,
            })
          }
        }
      }

      if (isTSDeclaration(stmt.declaration)) {
        const decl = stmt.declaration

        if (decl.id?.type === 'Identifier') {
          const exportedName = decl.id.name
          exports[exportedName] = await resolveTSReferencedType({
            scope,
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
    tryResolve(`${id}.d.ts`, importer) ||
    tryResolve(`${id}/index`, importer) ||
    tryResolve(`${id}/index.ts`, importer) ||
    tryResolve(`${id}/index.d.ts`, importer)
  )
}

export function setResolveTSFileIdImpl(impl: ResolveTSFileIdImpl) {
  resolveTSFileIdImpl = impl
}
