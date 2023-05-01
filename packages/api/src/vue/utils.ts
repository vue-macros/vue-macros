import { type Node } from '@babel/types'
import { isTSExports, resolveTSReferencedType } from '../ts'
import { type TSExports, type TSResolvedType } from '../ts'

export async function inferRuntimeType(
  node: TSResolvedType | TSExports
): Promise<string[]> {
  if (isTSExports(node)) return ['Object']

  switch (node.type.type) {
    case 'TSStringKeyword':
      return ['String']
    case 'TSNumberKeyword':
      return ['Number']
    case 'TSBooleanKeyword':
      return ['Boolean']
    case 'TSObjectKeyword':
      return ['Object']
    case 'TSTypeLiteral': {
      // TODO (nice to have) generate runtime property validation
      const types = new Set<string>()
      for (const m of node.type.members) {
        switch (m.type) {
          case 'TSCallSignatureDeclaration':
          case 'TSConstructSignatureDeclaration':
            types.add('Function')
            break
          default:
            types.add('Object')
        }
      }
      return Array.from(types)
    }
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
          case 'Required':
          case 'InstanceType':
            return ['Object']

          case 'Extract':
            if (
              node.type.typeParameters &&
              node.type.typeParameters.params[1]
            ) {
              const t = await resolveTSReferencedType({
                scope: node.scope,
                type: node.type.typeParameters.params[1],
              })
              if (t) return inferRuntimeType(t)
            }
            return ['null']
          case 'Exclude':
            if (
              node.type.typeParameters &&
              node.type.typeParameters.params[0]
            ) {
              const t = await resolveTSReferencedType({
                scope: node.scope,
                type: node.type.typeParameters.params[0],
              })
              if (t) return inferRuntimeType(t)
            }
            return ['null']
        }
      }
      return [`null`]

    case 'TSUnionType': {
      const types = (
        await Promise.all(
          node.type.types.map(async (subType) => {
            const resolved = await resolveTSReferencedType({
              scope: node.scope,
              type: subType,
            })
            return resolved && !isTSExports(resolved)
              ? inferRuntimeType(resolved)
              : undefined
          })
        )
      ).flatMap((t) => (t ? t : ['null']))
      return [...new Set(types)]
    }
    case 'TSIntersectionType':
      return ['Object']

    case 'TSSymbolKeyword':
      return ['Symbol']

    case 'TSInterfaceDeclaration':
      return ['Object']

    default:
      return [`null`] // no runtime check
  }
}

export function attachNodeLoc(node: Node, newNode: Node) {
  newNode.start = node.start
  newNode.end = node.end
}

export function toRuntimeTypeString(types: string[], isProduction?: boolean) {
  if (isProduction) {
    const hasBoolean = types.includes('Boolean')
    types = types.filter(
      (t) =>
        t === 'Boolean' || (hasBoolean && t === 'String') || t === 'Function'
    )
  }
  if (types.length === 0) return undefined
  return types.length > 1 ? `[${types.join(', ')}]` : types[0]
}
