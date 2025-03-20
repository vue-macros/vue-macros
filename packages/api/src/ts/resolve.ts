import {
  createStringLiteral,
  createTSUnionType,
  resolveLiteral,
  resolveObjectKey,
  type TransformError,
} from '@vue-macros/common'
import { ok, okAsync, safeTry, type ResultAsync } from 'neverthrow'
import type { ErrorUnknownNode } from '../error'
import { isTSNamespace } from './namespace'
import {
  checkForTSProperties,
  getTSPropertiesKeys,
  resolveTSProperties,
  type TSProperties,
} from './property'
import {
  isSupportedForTSReferencedType,
  resolveTSReferencedType,
  type TSResolvedType,
} from './resolve-reference'
import type { TSScope } from './scope'
import type {
  BigIntLiteral,
  BooleanLiteral,
  Expression,
  Node,
  NumericLiteral,
  StringLiteral,
  TemplateElement,
  TemplateLiteral,
  TSFunctionType,
  TSIndexedAccessType,
  TSLiteralType,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeElement,
  TSTypeOperator,
  TSUnionType,
} from '@babel/types'

export function resolveTSTemplateLiteral({
  type,
  scope,
}: TSResolvedType<TemplateLiteral>): ResultAsync<
  StringLiteral[],
  TransformError<ErrorUnknownNode>
> {
  return resolveKeys('', type.quasis, type.expressions).map((keys) =>
    keys.map((k) => createStringLiteral(k)),
  )

  function resolveKeys(
    prefix: string,
    quasis: TemplateElement[],
    expressions: Array<Expression | TSType>,
  ): ResultAsync<string[], TransformError<ErrorUnknownNode>> {
    return safeTry(async function* () {
      if (expressions.length === 0) {
        return ok([prefix + (quasis[0]?.value.cooked ?? '')])
      }

      const [expr, ...restExpr] = expressions
      const [quasi, ...restQuasis] = quasis
      const subTypes = resolveMaybeTSUnion(expr)

      const keys: string[] = []
      for (const type of subTypes) {
        if (!isSupportedForTSReferencedType(type)) continue

        const resolved = yield* resolveTSReferencedType({
          type,
          scope,
        })
        if (!resolved || isTSNamespace(resolved)) continue

        const types = resolveMaybeTSUnion(resolved.type)
        for (const type of types) {
          if (type.type !== 'TSLiteralType') continue

          const literal = yield* resolveTSLiteralType({ type, scope })
          if (!literal) continue

          const subKeys = resolveMaybeTSUnion(literal).map((literal) =>
            String(resolveLiteral(literal)),
          )
          for (const key of subKeys) {
            const newPrefix = prefix + quasi.value.cooked + String(key)
            keys.push(...(yield* resolveKeys(newPrefix, restQuasis, restExpr)))
          }
        }
      }
      return ok(keys)
    })
  }
}

export function resolveTSLiteralType({
  type,
  scope,
}: TSResolvedType<TSLiteralType>): ResultAsync<
  | StringLiteral[]
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | BigIntLiteral
  | undefined,
  TransformError<ErrorUnknownNode>
> {
  if (type.literal.type === 'UnaryExpression') return okAsync(undefined)
  if (type.literal.type === 'TemplateLiteral') {
    return resolveTSTemplateLiteral({ type: type.literal, scope })
  }
  return okAsync(type.literal)
}

/**
 * @limitation don't support index signature
 */
export function resolveTypeElements(
  scope: TSScope,
  elements: Array<TSTypeElement>,
): TSProperties {
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

export function resolveTSIndexedAccessType(
  { scope, type }: TSResolvedType<TSIndexedAccessType>,
  stacks: TSResolvedType<any>[] = [],
): ResultAsync<
  { type: TSUnionType; scope: TSScope } | void,
  TransformError<ErrorUnknownNode>
> {
  return safeTry(async function* () {
    const object = yield* resolveTSReferencedType(
      { type: type.objectType, scope },
      stacks,
    )
    if (!object || isTSNamespace(object)) return ok()

    const objectType = object.type
    if (type.indexType.type === 'TSNumberKeyword') {
      let types: TSType[]

      if (objectType.type === 'TSArrayType') {
        types = [objectType.elementType]
      } else if (objectType.type === 'TSTupleType') {
        types = objectType.elementTypes.map((t) =>
          t.type === 'TSNamedTupleMember' ? t.elementType : t,
        )
      } else if (
        objectType.type === 'TSTypeReference' &&
        objectType.typeName.type === 'Identifier' &&
        objectType.typeName.name === 'Array' &&
        objectType.typeParameters
      ) {
        types = objectType.typeParameters.params
      } else {
        return ok()
      }

      return ok({ type: createTSUnionType(types), scope })
    } else if (
      objectType.type !== 'TSInterfaceDeclaration' &&
      objectType.type !== 'TSTypeLiteral' &&
      objectType.type !== 'TSIntersectionType' &&
      objectType.type !== 'TSMappedType' &&
      objectType.type !== 'TSFunctionType'
    )
      return ok()

    const properties = yield* resolveTSProperties({
      type: objectType,
      scope: object.scope,
    })

    const indexTypes = resolveMaybeTSUnion(type.indexType)
    const indexes: TSType[] = []
    let optional = false

    for (const index of indexTypes) {
      let keys: string[]

      if (index.type === 'TSLiteralType') {
        const literal = yield* resolveTSLiteralType({
          type: index,
          scope: object.scope,
        })
        if (!literal) continue
        keys = resolveMaybeTSUnion(literal).map((literal) =>
          String(resolveLiteral(literal)),
        )
      } else if (index.type === 'TSTypeOperator') {
        const keysStrings = yield* resolveTSTypeOperator({
          type: index,
          scope: object.scope,
        })
        if (!keysStrings) continue
        keys = resolveMaybeTSUnion(keysStrings).map((literal) =>
          String(resolveLiteral(literal)),
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
              }),
            ),
          )
        }
      }
    }

    if (indexes.length === 0) return ok()
    if (optional) indexes.push({ type: 'TSUndefinedKeyword' })

    return ok({ type: createTSUnionType(indexes), scope })
  })
}

export function resolveTSTypeOperator(
  { scope, type }: TSResolvedType<TSTypeOperator>,
  stacks: TSResolvedType<any>[] = [],
): ResultAsync<StringLiteral[] | void, TransformError<ErrorUnknownNode>> {
  return safeTry(async function* () {
    if (type.operator !== 'keyof') return ok()

    const resolved = yield* resolveTSReferencedType(
      {
        type: type.typeAnnotation,
        scope,
      },
      stacks,
    )
    if (!resolved || isTSNamespace(resolved)) return ok()
    const { type: resolvedType, scope: resolvedScope } = resolved
    if (!checkForTSProperties(resolvedType)) return ok()

    const properties = yield* resolveTSProperties({
      type: resolvedType,
      scope: resolvedScope,
    })

    return ok(
      getTSPropertiesKeys(properties).map((k) => createStringLiteral(k)),
    )
  })
}

export function resolveMaybeTSUnion<T extends Node>(node: T | T[]): T[]
export function resolveMaybeTSUnion<T extends Node>(node: T): (T | TSType)[]
export function resolveMaybeTSUnion<T extends Node>(
  node: T | T[],
): (T | TSType)[] {
  if (Array.isArray(node)) return node
  if (node.type === 'TSUnionType')
    return node.types.flatMap((t) => resolveMaybeTSUnion(t))
  return [node]
}
