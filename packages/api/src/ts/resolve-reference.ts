import { resolveIdentifier } from '@vue-macros/common'
import {
  type Identifier,
  type Node,
  type TSParenthesizedType,
  type TSType,
  type TSTypeAliasDeclaration,
  isTSType,
} from '@babel/types'
import {
  type TSNamespace,
  isTSNamespace,
  resolveTSNamespace,
} from './namespace'
import { resolveTSIndexedAccessType } from './resolve'
import { type TSScope, resolveTSScope } from './scope'
import { type TSDeclaration, isTSDeclaration } from './is'

export interface TSResolvedType<
  T =
    | Exclude<TSType, TSParenthesizedType>
    | Exclude<TSDeclaration, TSTypeAliasDeclaration>,
> {
  scope: TSScope
  type: T
}

type TSReferencedType = TSType | Identifier | TSDeclaration

export function isSupportedForTSReferencedType(
  node: Node,
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
  stacks: TSResolvedType<any>[] = [],
): Promise<TSResolvedType | TSNamespace | undefined> {
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
        stacks,
      )
    case 'TSIndexedAccessType':
      return resolveTSIndexedAccessType({ type, scope }, stacks)

    case 'TSModuleDeclaration': {
      if (type.body.type === 'TSModuleBlock') {
        const newScope: TSScope = {
          kind: 'module',
          ast: type.body,
          scope,
        }
        await resolveTSNamespace(newScope)
        return newScope.exports
      }
      return undefined
    }
  }

  if (type.type !== 'Identifier' && type.type !== 'TSTypeReference')
    return { scope, type }

  await resolveTSNamespace(scope)
  const refNames = resolveIdentifier(
    type.type === 'TSTypeReference' ? type.typeName : type,
  )

  let resolved: TSResolvedType | TSNamespace | undefined =
    resolveTSScope(scope).declarations!

  for (const name of refNames) {
    if (isTSNamespace(resolved) && resolved[name]) {
      resolved = resolved[name]
    } else if (type.type === 'TSTypeReference') {
      return { type, scope }
    }
  }

  return resolved
}
