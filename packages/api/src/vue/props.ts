import {
  babelParse,
  isStaticObjectKey,
  isTypeOf,
  resolveIdentifier,
  resolveObjectExpression,
  resolveString,
  TransformError,
  type MagicStringAST,
  type SFC,
} from '@vue-macros/common'
import { err, ok, safeTry, type ResultAsync } from 'neverthrow'
import {
  isTSNamespace,
  resolveTSProperties,
  resolveTSReferencedType,
  resolveTSScope,
  type TSFile,
  type TSNamespace,
  type TSProperties,
  type TSResolvedType,
  type TSScope,
} from '../ts'
import type { ErrorResolveTS, ErrorUnknownNode } from '../error'
import { DefinitionKind, type ASTDefinition } from './types'
import { attachNodeLoc, inferRuntimeType } from './utils'
import type {
  CallExpression,
  Expression,
  ExpressionStatement,
  LVal,
  Node,
  ObjectMethod,
  ObjectProperty,
  StringLiteral,
  TSInterfaceDeclaration,
  TSIntersectionType,
  TSMappedType,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeLiteral,
  TSTypeReference,
  TSUnionType,
  VariableDeclaration,
  VoidPattern,
} from '@babel/types'

type BuiltInTypesHandler = Record<
  string,
  {
    handleType: (resolved: TSTypeReference) => TSType | undefined
    handleTSProperties?: (properties: TSProperties) => TSProperties
  }
>
const builtInTypesHandlers: BuiltInTypesHandler = {
  Partial: {
    handleType(resolved) {
      return resolved.typeParameters?.params[0]
    },
    handleTSProperties(properties) {
      for (const prop of Object.values(properties.properties)) {
        prop.optional = true
      }
      return properties
    },
  },
  Required: {
    handleType(resolved) {
      return resolved.typeParameters?.params[0]
    },
    handleTSProperties(properties) {
      for (const prop of Object.values(properties.properties)) {
        prop.optional = false
      }
      return properties
    },
  },
  Readonly: {
    handleType(resolved) {
      return resolved.typeParameters?.params[0]
    },
  },
  // TODO: pick, omit
}

export function handleTSPropsDefinition({
  s,
  file,
  offset,

  definePropsAst,
  typeDeclRaw,

  withDefaultsAst,
  defaultsDeclRaw,

  statement,
  declId,
}: {
  s: MagicStringAST
  file: TSFile
  sfc: SFC
  offset: number

  definePropsAst: CallExpression
  typeDeclRaw: TSType

  withDefaultsAst?: CallExpression
  defaultsDeclRaw?: DefaultsASTRaw

  statement: DefinePropsStatement
  declId?: VoidPattern | LVal
}): ResultAsync<TSProps, TransformError<ErrorResolveTS | ErrorUnknownNode>> {
  return safeTry(async function* () {
    const { definitions, definitionsAst } = yield* resolveDefinitions({
      type: typeDeclRaw,
      scope: file,
    })
    const { defaults, defaultsAst } = resolveDefaults(defaultsDeclRaw)

    const addProp: TSProps['addProp'] = (name, value, optional) => {
      const { key, signature, valueAst, signatureAst } = buildNewProp(
        name,
        value,
        optional,
      )
      if (definitions[key]) return false

      if (definitionsAst.scope === file) {
        if (definitionsAst.ast.type === 'TSIntersectionType') {
          s.appendLeft(definitionsAst.ast.end! + offset, ` & { ${signature} }`)
        } else {
          s.appendLeft(definitionsAst.ast.end! + offset - 1, `  ${signature}\n`)
        }
      }

      definitions[key] = {
        type: 'property',
        value: {
          code: value,
          ast: valueAst,
          scope: undefined,
        },
        optional: !!optional,
        signature: {
          code: signature,
          ast: signatureAst,
          scope: undefined,
        },
        addByAPI: true,
      }
      return true
    }

    const setProp: TSProps['setProp'] = (name, value, optional) => {
      const { key, signature, signatureAst, valueAst } = buildNewProp(
        name,
        value,
        optional,
      )

      const def = definitions[key]
      if (!definitions[key]) return false

      switch (def.type) {
        case 'method': {
          attachNodeLoc(def.methods[0].ast, signatureAst)

          if (def.methods[0].scope === file)
            s.overwriteNode(def.methods[0].ast, signature, { offset })

          def.methods.slice(1).forEach((method) => {
            if (method.scope === file) {
              s.removeNode(method.ast, { offset })
            }
          })
          break
        }
        case 'property': {
          attachNodeLoc(def.signature.ast, signatureAst)

          if (def.signature.scope === file && !def.addByAPI) {
            s.overwriteNode(def.signature.ast, signature, { offset })
          }
          break
        }
      }

      definitions[key] = {
        type: 'property',
        value: {
          code: value,
          ast: valueAst,
          scope: undefined as any,
        },
        optional: !!optional,
        signature: {
          code: signature,
          ast: signatureAst,
          scope: undefined as any,
        },
        addByAPI: def.type === 'property' && def.addByAPI,
      }
      return true
    }

    const removeProp: TSProps['removeProp'] = (name) => {
      const key = resolveString(name)
      if (!definitions[key]) return false

      const def = definitions[key]
      switch (def.type) {
        case 'property': {
          if (def.signature.scope === file && !def.addByAPI) {
            s.removeNode(def.signature.ast, { offset })
          }
          break
        }
        case 'method':
          def.methods.forEach((method) => {
            if (method.scope === file) s.removeNode(method.ast, { offset })
          })
          break
      }

      delete definitions[key]

      return true
    }

    const getRuntimeDefinitions: TSProps['getRuntimeDefinitions'] = () => {
      return safeTry(async function* () {
        const props: Record<string, RuntimePropDefinition> = Object.create(null)

        for (const [propName, def] of Object.entries(definitions)) {
          let prop: RuntimePropDefinition
          if (def.type === 'method') {
            prop = {
              type: ['Function'],
              required: !def.optional,
            }
          } else {
            const resolvedType = def.value
            if (resolvedType) {
              const optional = def.optional

              prop = {
                type: yield* inferRuntimeType({
                  scope: resolvedType.scope || file,
                  type: resolvedType.ast,
                }),
                required: !optional,
              }
            } else {
              prop = { type: ['null'], required: false }
            }
          }
          const defaultValue = defaults?.[propName]
          if (defaultValue) {
            prop.default = (key = 'default') => {
              switch (defaultValue.type) {
                case 'ObjectMethod':
                  return `${
                    defaultValue.kind === 'method'
                      ? ''
                      : `${defaultValue.kind} `
                  }${defaultValue.async ? `async ` : ''}${key}(${s.sliceNode(
                    defaultValue.params,
                    { offset },
                  )}) ${s.sliceNode(defaultValue.body, { offset })}`
                case 'ObjectProperty':
                  return `${key}: ${s.sliceNode(defaultValue.value, { offset })}`
              }
            }
          }
          props[propName] = prop
        }
        return ok(props)
      })
    }

    return ok<TSProps>({
      kind: DefinitionKind.TS,
      definitions,
      defaults,
      declId,
      addProp,
      setProp,
      removeProp,
      getRuntimeDefinitions,

      // AST
      definitionsAst,
      defaultsAst,
      statementAst: statement,
      definePropsAst,
      withDefaultsAst,
    })
  })

  function resolveUnion(
    definitionsAst: TSUnionType,
    scope: TSScope,
  ): ResultAsync<
    {
      definitions: TSProps['definitions']
      definitionsAst: TSProps['definitionsAst']
    },
    TransformError<ErrorResolveTS | ErrorUnknownNode>
  > {
    return safeTry(async function* () {
      const unionDefs: TSProps['definitions'][] = []
      const keys = new Set<string>()
      for (const type of definitionsAst.types) {
        const defs = yield* resolveDefinitions({ type, scope }).map(
          ({ definitions }) => definitions,
        )
        Object.keys(defs).forEach((key) => keys.add(key))
        unionDefs.push(defs)
      }

      const results: TSProps['definitions'] = Object.create(null)
      for (const key of keys) {
        let optional = false
        let result: TSPropsMethod | TSPropsProperty | undefined

        for (const defMap of unionDefs) {
          const def = defMap[key]
          if (!def) {
            optional = true
            continue
          }
          optional ||= def.optional

          if (!result) {
            result = def
            continue
          }

          if (result.type === 'method' && def.type === 'method') {
            result.methods.push(...def.methods)
          } else if (result.type === 'property' && def.type === 'property') {
            if (!def.value) {
              continue
            } else if (!result.value) {
              result = def
              continue
            }

            const excludeTypes = [
              'TSImportType',
              'TSDeclareFunction',
              'TSEnumDeclaration',
              'TSInterfaceDeclaration',
              'TSModuleDeclaration',
              'TSImportEqualsDeclaration',
            ] as const
            if (
              isTypeOf(def.value.ast, excludeTypes) ||
              isTypeOf(result.value.ast, excludeTypes)
            ) {
              // no way!
              continue
            }

            if (result.value.ast.type === 'TSUnionType') {
              result.value.ast.types.push(def.value.ast)
            } else {
              // overwrite original to union type
              result = {
                type: 'property',
                value: buildDefinition({
                  scope,
                  type: {
                    type: 'TSUnionType',
                    types: [result.value.ast, def.value.ast],
                  } satisfies TSUnionType,
                }),
                signature: null as any,
                optional,
                addByAPI: false,
              }
            }
          } else {
            return err(
              new TransformError(
                `Cannot resolve TS definition. Union type contains different types of results.`,
              ),
            )
          }
        }

        if (result) {
          results[key] = { ...result, optional }
        }
      }

      return ok({
        definitions: results,
        definitionsAst: buildDefinition({ scope, type: definitionsAst }),
      })
    })
  }

  function resolveIntersection(
    definitionsAst: TSIntersectionType,
    scope: TSScope,
  ) {
    return safeTry(async function* () {
      const results: TSProps['definitions'] = Object.create(null)
      for (const type of definitionsAst.types) {
        const defMap = yield* resolveDefinitions({ type, scope }).map(
          ({ definitions }) => definitions,
        )
        for (const [key, def] of Object.entries(defMap)) {
          const result = results[key]
          if (!result) {
            results[key] = def
            continue
          }

          if (result.type === 'method' && def.type === 'method') {
            result.methods.push(...def.methods)
          } else {
            results[key] = def
          }
        }
      }

      return ok({
        definitions: results,
        definitionsAst: buildDefinition({ scope, type: definitionsAst }),
      })
    })
  }

  function resolveNormal(properties: TSProperties) {
    return safeTry(async function* () {
      const definitions: TSProps['definitions'] = Object.create(null)
      for (const [key, sign] of Object.entries(properties.methods)) {
        const methods = sign.map((sign) => buildDefinition(sign))
        definitions[key] = {
          type: 'method',
          methods,
          optional: sign.some((sign) => !!sign.type.optional),
        }
      }

      for (const [key, value] of Object.entries(properties.properties)) {
        const referenced = value.value
          ? yield* resolveTSReferencedType(value.value)
          : undefined
        definitions[key] = {
          type: 'property',
          addByAPI: false,
          value:
            referenced && !isTSNamespace(referenced)
              ? buildDefinition(referenced)
              : undefined,
          optional: value.optional,
          signature: buildDefinition(value.signature),
        }
      }

      return ok(definitions)
    })
  }

  function resolveDefinitions(typeDeclRaw: TSResolvedType<TSType>): ResultAsync<
    {
      definitions: TSProps['definitions']
      definitionsAst: TSProps['definitionsAst']
    },
    TransformError<ErrorResolveTS | ErrorUnknownNode>
  > {
    return safeTry(async function* () {
      let resolved:
        | TSResolvedType
        | TSResolvedType<TSType>
        | TSNamespace
        | undefined =
        (yield* resolveTSReferencedType(typeDeclRaw)) || typeDeclRaw

      let builtInTypesHandler: BuiltInTypesHandler[string] | undefined

      if (
        resolved &&
        !isTSNamespace(resolved) &&
        resolved.type.type === 'TSTypeReference' &&
        resolved.type.typeName.type === 'Identifier'
      ) {
        const typeName = resolved.type.typeName.name

        let type: TSType | undefined
        if (typeName in builtInTypesHandlers) {
          builtInTypesHandler = builtInTypesHandlers[typeName]
          type = builtInTypesHandler.handleType(resolved.type)
        }

        if (type)
          resolved = yield* resolveTSReferencedType({
            type,
            scope: resolved.scope,
          })
      }

      if (!resolved || isTSNamespace(resolved)) {
        return err(new TransformError('Cannot resolve TS definition.'))
      }

      const { type: definitionsAst, scope } = resolved
      if (definitionsAst.type === 'TSIntersectionType') {
        return resolveIntersection(definitionsAst, scope)
      } else if (definitionsAst.type === 'TSUnionType') {
        return resolveUnion(definitionsAst, scope)
      } else if (
        definitionsAst.type !== 'TSInterfaceDeclaration' &&
        definitionsAst.type !== 'TSTypeLiteral' &&
        definitionsAst.type !== 'TSMappedType'
      ) {
        return definitionsAst.type === 'TSTypeReference'
          ? err(
              new TransformError(
                `Cannot resolve TS type: ${resolveIdentifier(
                  definitionsAst.typeName,
                ).join('.')}`,
              ),
            )
          : err(
              new TransformError(
                `Cannot resolve TS definition: ${definitionsAst.type}`,
              ),
            )
      }

      let properties = yield* resolveTSProperties({
        scope,
        type: definitionsAst,
      })

      if (builtInTypesHandler?.handleTSProperties)
        properties = builtInTypesHandler.handleTSProperties(properties)

      return ok({
        definitions: yield* resolveNormal(properties),
        definitionsAst: buildDefinition({ scope, type: definitionsAst }),
      })
    })
  }

  function resolveDefaults(defaultsAst?: DefaultsASTRaw): {
    defaultsAst?: TSProps['defaultsAst']
    defaults?: TSProps['defaults']
  } {
    if (!defaultsAst) return {}

    const isStatic =
      defaultsAst.type === 'ObjectExpression' && isStaticObjectKey(defaultsAst)
    if (!isStatic) return { defaultsAst: defaultsAst as Expression }

    const defaults = resolveObjectExpression(defaultsAst)
    if (!defaults) return { defaultsAst }

    return { defaults, defaultsAst }
  }
}

function buildNewProp(
  name: string | StringLiteral,
  value: string,
  optional: boolean | undefined,
) {
  const key = resolveString(name)
  const signature = `${name}${optional ? '?' : ''}: ${value}`

  const valueAst = (babelParse(`type T = (${value})`, 'ts').body[0] as any)
    .typeAnnotation.typeAnnotation

  const signatureAst = (
    babelParse(`interface T {${signature}}`, 'ts').body[0] as any
  ).body.body[0]

  return { key, signature, signatureAst, valueAst }
}

function buildDefinition<T extends Node>({
  type,
  scope,
}: TSResolvedType<T>): ASTDefinition<T> {
  return {
    code: resolveTSScope(scope).file.content.slice(type.start!, type.end!),
    ast: type,
    scope,
  }
}

export type Props = /* ReferenceProps | ObjectProps | */ TSProps | undefined

export type DefinePropsStatement = VariableDeclaration | ExpressionStatement
export type DefaultsASTRaw = CallExpression['arguments'][number]

export interface PropsBase {
  declId?: VoidPattern | LVal
  statementAst: DefinePropsStatement
  definePropsAst: CallExpression
  withDefaultsAst?: CallExpression
}

// TODO: not implement yet
// export interface RuntimeProps extends PropsBase {
//   /**
//    * @example addProp('foo', 'String')
//    * @example addProp('foo', '{ type: String, default: "foo" }')
//    */
//   addProp(name: string | StringLiteral, definition: string): void

//   /**
//    * Removes specified prop from TS interface.
//    *
//    * @returns `true` if prop was removed, `false` if prop was not found.
//    */
//   removeProp(name: string | StringLiteral): boolean
// }

// export interface ReferenceProps extends RuntimeProps {
//   kind: DefinitionKind.Reference
// }

// export interface ObjectProps extends RuntimeProps {
//   kind: DefinitionKind.Object

//   /** propName -> definition */
//   definitions?: Record<string, string>
// }

export interface TSPropsMethod {
  type: 'method'
  methods: ASTDefinition<TSMethodSignature>[]
  optional: boolean
}

export interface TSPropsProperty {
  type: 'property'
  value: ASTDefinition<TSResolvedType['type']> | undefined
  optional: boolean
  signature: ASTDefinition<TSPropertySignature | TSMappedType>

  /** Whether added by `addProp` API */
  addByAPI: boolean
}

export interface RuntimePropDefinition {
  type: string[]
  required: boolean
  default?: (key?: string) => string
}

export interface TSProps extends PropsBase {
  kind: DefinitionKind.TS

  definitions: Record<string | number, TSPropsMethod | TSPropsProperty>
  definitionsAst: ASTDefinition<
    | TSInterfaceDeclaration
    | TSTypeLiteral
    | TSIntersectionType
    | TSUnionType
    | TSMappedType
    | TSTypeReference
  >

  /**
   * Default value of props.
   *
   * `undefined` if not defined or it's not a static expression that cannot be analyzed statically.
   */
  defaults?: Record<string, ObjectMethod | ObjectProperty>

  /**
   * `undefined` if not defined.
   */
  defaultsAst?: Expression

  /**
   * Adds a new prop to the definitions. `definitions` will updated after this call.
   *
   * Added definition cannot be set and removed again.
   *
   * @example addProp('foo', 'string ｜ boolean')
   *
   * @returns false if the definition already exists.
   */
  addProp: (
    name: string | StringLiteral,
    type: string,
    optional?: boolean,
  ) => boolean

  /**
   * Modify a definition of a prop. `definitions` will updated after this call.
   *
   * @limitation Cannot set the prop added by `addProp`.
   *
   * @example setProp('foo', 'string ｜ boolean')
   *
   * @returns false if the definition does not exist.
   */
  setProp: (
    name: string | StringLiteral,
    type: string,
    optional?: boolean,
  ) => boolean

  /**
   * Removes specified prop from TS interface. `definitions` will updated after this call.
   *
   * @limitation Cannot remove prop added by `addProp`. (it will be removed in definitions though)
   *
   * @returns `true` if prop was removed, `false` if prop was not found.
   */
  removeProp: (name: string | StringLiteral) => boolean

  /**
   * get runtime definitions.
   */
  getRuntimeDefinitions: () => ResultAsync<
    Record<string, RuntimePropDefinition>,
    TransformError<ErrorUnknownNode>
  >
}
