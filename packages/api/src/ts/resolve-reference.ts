import { resolveIdentifier, type TransformError } from '@vue-macros/common'
import { ok, safeTry, type ResultAsync } from 'neverthrow'
import type { ErrorUnknownNode } from '../error'
import { isTSDeclaration, type TSDeclaration } from './is'
import {
  isTSNamespace,
  resolveTSNamespace,
  type TSNamespace,
} from './namespace'
import { resolveTSIndexedAccessType } from './resolve'
import { resolveTSScope, type TSScope } from './scope'
import type {
  Identifier,
  Node,
  TSParenthesizedType,
  TSType,
  TSTypeAliasDeclaration,
} from '@babel/types'

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
  return (
    node.type.startsWith('TS') ||
    node.type === 'Identifier' ||
    isTSDeclaration(node)
  )
}

/**
 * Resolve a reference to a type.
 *
 * Supports `type` and `interface` only.
 *
 * @limitation don't support non-TS declaration (e.g. class, function...)
 */
export function resolveTSReferencedType(
  ref: TSResolvedType<TSReferencedType>,
  stacks: TSResolvedType<any>[] = [],
): ResultAsync<
  TSResolvedType | TSNamespace | undefined,
  TransformError<ErrorUnknownNode>
> {
  return safeTry(async function* () {
    const { scope, type } = ref
    if (stacks.some((stack) => stack.scope === scope && stack.type === type)) {
      return ok(ref as any)
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
          yield* resolveTSNamespace(newScope)
          return ok(newScope.exports)
        }
        return ok()
      }
    }

    if (type.type !== 'Identifier' && type.type !== 'TSTypeReference')
      return ok({ scope, type })

    yield* resolveTSNamespace(scope)
    const refNames = resolveIdentifier(
      type.type === 'TSTypeReference' ? type.typeName : type,
    )

    let resolved: TSResolvedType | TSNamespace | undefined =
      resolveTSScope(scope).declarations!

    for (const name of refNames) {
      if (isTSNamespace(resolved) && resolved[name]) {
        resolved = resolved[name]
      } else if (type.type === 'TSTypeReference') {
        return ok({ type, scope })
      }
    }

    return ok(resolved)
  })
}
