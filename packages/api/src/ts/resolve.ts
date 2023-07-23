import { resolveLiteral, resolveObjectKey } from '@vue-macros/common'
import {
  type BigIntLiteral,
  type BooleanLiteral,
  type Expression,
  type Node,
  type NumericLiteral,
  type StringLiteral,
  type TSFunctionType,
  type TSIndexedAccessType,
  type TSLiteralType,
  type TSMethodSignature,
  type TSPropertySignature,
  type TSType,
  type TSTypeElement,
  type TSTypeOperator,
  type TSUnionType,
  type TemplateElement,
  type TemplateLiteral,
} from '@babel/types'
import { createStringLiteral, createUnionType } from './create'
import { isTSNamespace } from './namespace'
import {
  type TSProperties,
  checkForTSProperties,
  getTSPropertiesKeys,
  resolveTSProperties,
} from './property'
import {
  type TSResolvedType,
  isSupportedForTSReferencedType,
  resolveTSReferencedType,
} from './resolve-reference'
import { type TSScope } from './scope'

export async function resolveTSTemplateLiteral({
  type,
  scope,
}: TSResolvedType<TemplateLiteral>): Promise<StringLiteral[]> {
  const types = (await resolveKeys('', type.quasis, type.expressions)).map(
    (k) => createStringLiteral(k)
  )
  return types

  async function resolveKeys(
    prefix: string,
    quasis: TemplateElement[],
    expressions: Array<Expression | TSType>
  ): Promise<string[]> {
    if (expressions.length === 0) {
      return [prefix + (quasis[0]?.value.cooked ?? '')]
    }

    const [expr, ...restExpr] = expressions
    const [quasi, ...restQuasis] = quasis
    const subTypes = resolveMaybeTSUnion(expr)

    const keys: string[] = []
    for (const type of subTypes) {
      if (!isSupportedForTSReferencedType(type)) continue

      const resolved = await resolveTSReferencedType({
        type,
        scope,
      })
      if (!resolved || isTSNamespace(resolved)) continue

      const types = resolveMaybeTSUnion(resolved.type)
      for (const type of types) {
        if (type.type !== 'TSLiteralType') continue

        const literal = await resolveTSLiteralType({ type, scope })
        if (!literal) continue

        const subKeys = resolveMaybeTSUnion(literal).map((literal) =>
          String(resolveLiteral(literal))
        )
        for (const key of subKeys) {
          const newPrefix = prefix + quasi.value.cooked + String(key)
          keys.push(...(await resolveKeys(newPrefix, restQuasis, restExpr)))
        }
      }
    }
    return keys
  }
}

export async function resolveTSLiteralType({
  type,
  scope,
}: TSResolvedType<TSLiteralType>): Promise<
  | StringLiteral[]
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | BigIntLiteral
  | undefined
> {
  if (type.literal.type === 'UnaryExpression') return
  if (type.literal.type === 'TemplateLiteral') {
    const types = await resolveTSTemplateLiteral({ type: type.literal, scope })
    return types
  }
  return type.literal
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
    methods: Object.create(null),
    properties: Object.create(null),
  }

  const tryGetKey = (element: TSMethodSignature | TSPropertySignature) => {
    try {
      return resolveObjectKey(element)
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

export async function resolveTSIndexedAccessType(
  { scope, type }: TSResolvedType<TSIndexedAccessType>,
  stacks: TSResolvedType<any>[] = []
): Promise<{ type: TSUnionType; scope: TSScope } | undefined> {
  const object = await resolveTSReferencedType(
    { type: type.objectType, scope },
    stacks
  )
  if (!object || isTSNamespace(object)) return undefined

  const objectType = object.type
  if (type.indexType.type === 'TSNumberKeyword') {
    let types: TSType[]

    if (objectType.type === 'TSArrayType') {
      types = [objectType.elementType]
    } else if (objectType.type === 'TSTupleType') {
      types = objectType.elementTypes.map((t) =>
        t.type === 'TSNamedTupleMember' ? t.elementType : t
      )
    } else if (
      objectType.type === 'TSTypeReference' &&
      objectType.typeName.type === 'Identifier' &&
      objectType.typeName.name === 'Array' &&
      objectType.typeParameters
    ) {
      types = objectType.typeParameters.params
    } else {
      return undefined
    }

    return { type: createUnionType(types), scope }
  } else if (
    objectType.type !== 'TSInterfaceDeclaration' &&
    objectType.type !== 'TSTypeLiteral' &&
    objectType.type !== 'TSIntersectionType' &&
    objectType.type !== 'TSMappedType' &&
    objectType.type !== 'TSFunctionType'
  )
    return undefined

  const properties = await resolveTSProperties({
    type: objectType,
    scope: object.scope,
  })

  const indexTypes = resolveMaybeTSUnion(type.indexType)
  const indexes: TSType[] = []
  let optional = false

  for (const index of indexTypes) {
    let keys: string[]

    if (index.type === 'TSLiteralType') {
      const literal = await resolveTSLiteralType({
        type: index,
        scope: object.scope,
      })
      if (!literal) continue
      keys = resolveMaybeTSUnion(literal).map((literal) =>
        String(resolveLiteral(literal))
      )
    } else if (index.type === 'TSTypeOperator') {
      const keysStrings = await resolveTSTypeOperator({
        type: index,
        scope: object.scope,
      })
      if (!keysStrings) continue
      keys = resolveMaybeTSUnion(keysStrings).map((literal) =>
        String(resolveLiteral(literal))
      )
    } else continue

    for (const key of keys) {
      const property = properties.properties[key]
      if (property) {
        optional ||= property.optional
        const propertyType = properties.properties[key].value
        if (propertyType) indexes.push(propertyType.type)
      }

      const methods = properties.methods[key]
      if (methods) {
        optional ||= methods.some((m) => !!m.type.optional)
        indexes.push(
          ...methods.map(
            ({ type }): TSFunctionType => ({
              ...type,
              type: 'TSFunctionType',
            })
          )
        )
      }
    }
  }

  if (indexes.length === 0) return undefined
  if (optional) indexes.push({ type: 'TSUndefinedKeyword' })

  return { type: createUnionType(indexes), scope }
}

export async function resolveTSTypeOperator(
  { scope, type }: TSResolvedType<TSTypeOperator>,
  stacks: TSResolvedType<any>[] = []
) {
  if (type.operator !== 'keyof') return undefined

  const resolved = await resolveTSReferencedType(
    {
      type: type.typeAnnotation,
      scope,
    },
    stacks
  )
  if (!resolved || isTSNamespace(resolved)) return undefined
  const { type: resolvedType, scope: resolvedScope } = resolved
  if (!checkForTSProperties(resolvedType)) return undefined

  const properties = await resolveTSProperties({
    type: resolvedType,
    scope: resolvedScope,
  })

  return getTSPropertiesKeys(properties).map((k) => createStringLiteral(k))
}

export function resolveMaybeTSUnion<T extends Node>(node: T | T[]): T[]
export function resolveMaybeTSUnion<T extends Node>(node: T): (T | TSType)[]
export function resolveMaybeTSUnion<T extends Node>(
  node: T | T[]
): (T | TSType)[] {
  if (Array.isArray(node)) return node
  if (node.type === 'TSUnionType')
    return node.types.flatMap((t) => resolveMaybeTSUnion(t))
  return [node]
}
