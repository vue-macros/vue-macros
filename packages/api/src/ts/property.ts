import { resolveLiteral } from '@vue-macros/common'
import {
  type TSResolvedType,
  resolveTSReferencedType,
} from './resolve-reference'
import { type TSNamespace, isTSNamespace } from './namespace'
import {
  resolveMaybeTSUnion,
  resolveTSLiteralType,
  resolveTypeElements,
} from './resolve'
import type {
  Node,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSFunctionType,
  TSInterfaceBody,
  TSInterfaceDeclaration,
  TSIntersectionType,
  TSMappedType,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeLiteral,
} from '@babel/types'

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

export function checkForTSProperties(
  node?: Node
): node is
  | TSInterfaceDeclaration
  | TSInterfaceBody
  | TSTypeLiteral
  | TSIntersectionType
  | TSMappedType
  | TSFunctionType {
  return (
    !!node &&
    [
      'TSInterfaceDeclaration',
      'TSInterfaceBody',
      'TSTypeLiteral',
      'TSIntersectionType',
      'TSMappedType',
      'TSFunctionType',
    ].includes(node.type)
  )
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
        methods: Object.create(null),
        properties: Object.create(null),
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
        methods: Object.create(null),
        properties: Object.create(null),
      }
      if (!type.typeParameter.constraint) return properties

      const constraint = await resolveTSReferencedType({
        type: type.typeParameter.constraint,
        scope,
      })
      if (!constraint || isTSNamespace(constraint)) return properties

      const types = resolveMaybeTSUnion(constraint.type)
      for (const subType of types) {
        if (subType.type !== 'TSLiteralType') continue

        const literal = await resolveTSLiteralType({
          type: subType,
          scope: constraint.scope,
        })
        if (!literal) continue

        const keys = resolveMaybeTSUnion(literal).map((literal) =>
          String(resolveLiteral(literal))
        )
        for (const key of keys) {
          properties.properties[String(key)] = {
            value: type.typeAnnotation
              ? { scope, type: type.typeAnnotation }
              : null,
            optional: type.optional === '+' || type.optional === true,
            signature: { type, scope },
          }
        }
      }

      return properties
    }
    case 'TSFunctionType': {
      const properties: TSProperties = {
        callSignatures: [{ type, scope }],
        constructSignatures: [],
        methods: Object.create(null),
        properties: Object.create(null),
      }
      return properties
    }
    default:
      // @ts-expect-error type is never
      throw new Error(`unknown node: ${type?.type}`)
  }

  function filterValidExtends(
    node: TSResolvedType | TSNamespace | undefined
  ): node is TSResolvedType<
    TSInterfaceDeclaration | TSTypeLiteral | TSIntersectionType
  > {
    return !isTSNamespace(node) && checkForTSProperties(node?.type)
  }
}

export function getTSPropertiesKeys(properties: TSProperties) {
  return [
    ...new Set([
      ...Object.keys(properties.properties),
      ...Object.keys(properties.methods),
    ]),
  ]
}
