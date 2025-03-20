import { ok, safeTry, type ResultAsync } from 'neverthrow'
import {
  isTSNamespace,
  resolveTSProperties,
  resolveTSReferencedType,
  type TSNamespace,
  type TSResolvedType,
} from '../ts'
import type { ErrorUnknownNode } from '../error'
import type { Node } from '@babel/types'
import type { TransformError } from '@vue-macros/common'

export const UNKNOWN_TYPE = 'Unknown'

export function inferRuntimeType(
  node: TSResolvedType | TSNamespace,
): ResultAsync<string[], TransformError<ErrorUnknownNode>> {
  return safeTry(async function* () {
    if (isTSNamespace(node)) return ok(['Object'])

    switch (node.type.type) {
      case 'TSStringKeyword':
        return ok(['String'])
      case 'TSNumberKeyword':
        return ok(['Number'])
      case 'TSBooleanKeyword':
        return ok(['Boolean'])
      case 'TSObjectKeyword':
        return ok(['Object'])
      case 'TSInterfaceDeclaration':
      case 'TSTypeLiteral': {
        // TODO (nice to have) generate runtime property validation

        const resolved = yield* resolveTSProperties({
          type: node.type,
          scope: node.scope,
        })

        const types = new Set<string>()

        if (
          resolved.callSignatures.length ||
          resolved.constructSignatures.length
        ) {
          types.add('Function')
        }
        if (
          Object.keys(resolved.methods).length ||
          Object.keys(resolved.properties).length
        ) {
          types.add('Object')
        }

        return ok(Array.from(types))
      }
      case 'TSFunctionType':
        return ok(['Function'])
      case 'TSArrayType':
      case 'TSTupleType':
        // TODO (nice to have) generate runtime element type/length checks
        return ok(['Array'])

      case 'TSLiteralType':
        switch (node.type.literal.type) {
          case 'StringLiteral':
            return ok(['String'])
          case 'BooleanLiteral':
            return ok(['Boolean'])
          case 'NumericLiteral':
          case 'BigIntLiteral':
            return ok(['Number'])
        }
        break

      case 'TSTypeReference':
        if (node.type.typeName.type === 'Identifier') {
          switch (node.type.typeName.name) {
            case 'Array':
            case 'Function':
            case 'Object':
            case 'Set':
            case 'Map':
            case 'WeakSet':
            case 'WeakMap':
            case 'Date':
            case 'Promise':
              return ok([node.type.typeName.name])
            case 'Record':
            case 'Partial':
            case 'Readonly':
            case 'Pick':
            case 'Omit':
            case 'Required':
            case 'InstanceType':
              return ok(['Object'])

            case 'Extract':
              if (
                node.type.typeParameters &&
                node.type.typeParameters.params[1]
              ) {
                const t = yield* resolveTSReferencedType({
                  scope: node.scope,
                  type: node.type.typeParameters.params[1],
                })
                if (t) return inferRuntimeType(t)
              }
              break
            case 'Exclude':
              if (
                node.type.typeParameters &&
                node.type.typeParameters.params[0]
              ) {
                const t = yield* resolveTSReferencedType({
                  scope: node.scope,
                  type: node.type.typeParameters.params[0],
                })
                if (t) return inferRuntimeType(t)
              }
              break
          }
        }
        break

      case 'TSUnionType': {
        const types: string[] = []
        for (const subType of node.type.types) {
          const resolved = yield* resolveTSReferencedType({
            scope: node.scope,
            type: subType,
          })
          types.push(
            ...(resolved && !isTSNamespace(resolved)
              ? yield* inferRuntimeType(resolved)
              : ['null']),
          )
        }
        return ok([...new Set(types)])
      }
      case 'TSIntersectionType':
        return ok(['Object'])

      case 'TSSymbolKeyword':
        return ok(['Symbol'])
    }

    // no runtime check
    return ok([UNKNOWN_TYPE])
  })
}

export function attachNodeLoc(node: Node, newNode: Node): void {
  newNode.start = node.start
  newNode.end = node.end
}

export function genRuntimePropDefinition(
  types: string[] | undefined,
  isProduction: boolean,
  properties: string[],
): string {
  let type: string | undefined
  let skipCheck = false

  if (types) {
    const hasBoolean = types.includes('Boolean')
    const hasUnknown = types.includes(UNKNOWN_TYPE)

    if (isProduction || hasUnknown) {
      types = types.filter(
        (t) =>
          t === 'Boolean' || (hasBoolean && t === 'String') || t === 'Function',
      )

      skipCheck = !isProduction && hasUnknown && types.length > 0
    }

    if (types.length > 0) {
      type = types.length > 1 ? `[${types.join(', ')}]` : types[0]
    }
  }

  const pairs: string[] = []
  if (type) pairs.push(`type: ${type}`)
  if (skipCheck) pairs.push(`skipCheck: true`)
  pairs.push(...properties)

  return pairs.length > 0 ? `{ ${pairs.join(', ')} }` : 'null'
}
