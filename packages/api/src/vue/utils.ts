import { resolveTSReferencedType } from '../ts'
import type { Node } from '@babel/types'
import type { TSResolvedType } from '../ts'

export async function inferRuntimeType(
  node: TSResolvedType
): Promise<string[]> {
  switch (node.type.type) {
    case 'TSStringKeyword':
      return ['String']
    case 'TSNumberKeyword':
      return ['Number']
    case 'TSBooleanKeyword':
      return ['Boolean']
    case 'TSObjectKeyword':
      return ['Object']
    case 'TSTypeLiteral':
      // TODO (nice to have) generate runtime property validation
      return ['Object']
    case 'TSFunctionType':
      return ['Function']
    case 'TSArrayType':
    case 'TSTupleType':
      // TODO (nice to have) generate runtime element type/length checks
      return ['Array']

    case 'TSLiteralType':
      switch (node.type.literal.type) {
        case 'StringLiteral':
          return ['String']
        case 'BooleanLiteral':
          return ['Boolean']
        case 'NumericLiteral':
        case 'BigIntLiteral':
          return ['Number']
        default:
          return [`null`]
      }

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
            return [node.type.typeName.name]
          case 'Record':
          case 'Partial':
          case 'Readonly':
          case 'Pick':
          case 'Omit':
          case 'Exclude':
          case 'Extract':
          case 'Required':
          case 'InstanceType':
            return ['Object']
        }
      }
      return [`null`]

    case 'TSUnionType': {
      const types = (
        await Promise.all(
          node.type.types.map(async (subType) => {
            const resolved = await resolveTSReferencedType({
              file: node.file,
              type: subType,
            })
            return resolved ? inferRuntimeType(resolved) : undefined
          })
        )
      )
        .filter((t): t is string[] => !!t)
        .flat(1)
      return [...new Set(types)]
    }
    case 'TSIntersectionType':
      return ['Object']

    case 'TSSymbolKeyword':
      return ['Symbol']

    default:
      return [`null`] // no runtime check
  }
}

export function attachNodeLoc(node: Node, newNode: Node) {
  newNode.start = node.start
  newNode.end = node.end
}
