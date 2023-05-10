import {
  type Identifier,
  type ImportNamespaceSpecifier,
  type ImportSpecifier,
  type Node,
  type TSParenthesizedType,
  type TSType,
  type TSTypeAliasDeclaration,
  isTSType,
} from '@babel/types'
import { type TSExports, resolveTSExports } from './exports'
import { resolveTSFileId } from './impl'
import { parseTSEntityName, resolveTSIndexedAccessType } from './resolve'
import { type TSScope, getTSFile, resolveTSScope } from './scope'
import { type TSDeclaration, isTSDeclaration } from './is'

export interface TSResolvedType<
  T =
    | Exclude<TSType, TSParenthesizedType>
    | Exclude<TSDeclaration, TSTypeAliasDeclaration>
> {
  scope: TSScope
  type: T
}

type TSReferencedType = TSType | Identifier | TSDeclaration

export function isSupportedForTSReferencedType(
  node: Node
): node is TSReferencedType {
  return isTSType(node) || node.type === 'Identifier' || isTSDeclaration(node)
}

/**
 * Resolve a reference to a type.
 *
 * Supports `type` and `interface` only.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 */
export async function resolveTSReferencedType(
  ref: TSResolvedType<TSReferencedType>,
  stacks: TSResolvedType<any>[] = []
): Promise<TSResolvedType | TSExports | undefined> {
  const { scope, type } = ref
  if (stacks.some((stack) => stack.scope === scope && stack.type === type)) {
    return ref as any
  }
  stacks.push(ref)

  switch (type.type) {
    case 'TSTypeAliasDeclaration':
    case 'TSParenthesizedType':
      return resolveTSReferencedType(
        { scope, type: type.typeAnnotation },
        stacks
      )
    case 'TSIndexedAccessType':
      return resolveTSIndexedAccessType({ type, scope }, stacks)

    case 'TSModuleDeclaration': {
      if (type.body.type === 'TSModuleBlock') {
        return resolveTSExports({ type: type.body, scope })
      }
      return undefined
    }
  }

  let refNames: string[]
  if (type.type === 'Identifier') {
    refNames = [type.name]
  } else if (type.type === 'TSTypeReference') {
    if (type.typeName.type === 'Identifier') {
      refNames = [type.typeName.name]
    } else {
      refNames = parseTSEntityName(type.typeName).map((id) => id.name)
    }
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
        return exports
      }
    }
  }

  if (type.type === 'TSTypeReference') return { scope, type }
}
