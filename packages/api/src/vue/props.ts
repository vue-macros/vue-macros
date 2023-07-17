import {
  type MagicString,
  type SFC,
  babelParse,
  isStaticObjectKey,
  resolveIdentifier,
  resolveObjectExpression,
} from '@vue-macros/common'
import {
  type CallExpression,
  type Expression,
  type ExpressionStatement,
  type LVal,
  type Node,
  type ObjectMethod,
  type ObjectProperty,
  type StringLiteral,
  type TSInterfaceDeclaration,
  type TSIntersectionType,
  type TSMappedType,
  type TSMethodSignature,
  type TSPropertySignature,
  type TSType,
  type TSTypeLiteral,
  type TSTypeReference,
  type TSUnionType,
  type VariableDeclaration,
} from '@babel/types'
import {
  type TSFile,
  type TSNamespace,
  type TSProperties,
  type TSResolvedType,
  type TSScope,
  isTSNamespace,
  resolveTSProperties,
  resolveTSReferencedType,
  resolveTSScope,
} from '../ts'
import { keyToString } from '../utils'
import { type ASTDefinition, DefinitionKind } from './types'
import { attachNodeLoc, inferRuntimeType } from './utils'

type BuiltInTypesHandler = Record<
  string,
  {
    handleType(resolved: TSTypeReference): TSType | undefined
    handleTSProperties?(properties: TSProperties): TSProperties
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

export async function handleTSPropsDefinition({
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
  s: MagicString
  file: TSFile
  sfc: SFC
  offset: number

  definePropsAst: CallExpression
  typeDeclRaw: TSType

  withDefaultsAst?: CallExpression
  defaultsDeclRaw?: DefaultsASTRaw

  statement: DefinePropsStatement
  declId?: LVal
}): Promise<TSProps> {
  const { definitions, definitionsAst } = await resolveDefinitions({
    type: typeDeclRaw,
    scope: file,
  })
  const { defaults, defaultsAst } = resolveDefaults(defaultsDeclRaw)

  const addProp: TSProps['addProp'] = (name, value, optional) => {
    const { key, signature, valueAst, signatureAst } = buildNewProp(
      name,
      value,
      optional
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
      optional
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
    const key = keyToString(name)
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

  const getRuntimeDefinitions: TSProps['getRuntimeDefinitions'] = async () => {
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
            type: await inferRuntimeType({
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
                defaultValue.kind !== 'method' ? `${defaultValue.kind} ` : ''
              }${defaultValue.async ? `async ` : ''}${key}(${s.sliceNode(
                defaultValue.params,
                { offset }
              )}) ${s.sliceNode(defaultValue.body, { offset })}`
            case 'ObjectProperty':
              return `${key}: ${s.sliceNode(defaultValue.value, { offset })}`
          }
        }
      }
      props[propName] = prop
    }
    return props
  }

  return {
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
  }

  async function resolveUnion(definitionsAst: TSUnionType, scope: TSScope) {
    const unionDefs: TSProps['definitions'][] = []
    const keys = new Set<string>()
    for (const type of definitionsAst.types) {
      const defs = await resolveDefinitions({ type, scope }).then(
        ({ definitions }) => definitions
      )
      Object.keys(defs).map((key) => keys.add(key))
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

          if (
            def.value.ast.type === 'TSImportType' ||
            def.value.ast.type === 'TSDeclareFunction' ||
            def.value.ast.type === 'TSEnumDeclaration' ||
            def.value.ast.type === 'TSInterfaceDeclaration' ||
            def.value.ast.type === 'TSModuleDeclaration' ||
            result.value.ast.type === 'TSImportType' ||
            result.value.ast.type === 'TSDeclareFunction' ||
            result.value.ast.type === 'TSEnumDeclaration' ||
            result.value.ast.type === 'TSInterfaceDeclaration' ||
            result.value.ast.type === 'TSModuleDeclaration'
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
          throw new SyntaxError(
            `Cannot resolve TS definition. Union type contains different types of results.`
          )
        }
      }

      if (result) {
        results[key] = { ...result, optional }
      }
    }

    return {
      definitions: results,
      definitionsAst: buildDefinition({ scope, type: definitionsAst }),
    }
  }

  async function resolveIntersection(
    definitionsAst: TSIntersectionType,
    scope: TSScope
  ) {
    const results: TSProps['definitions'] = Object.create(null)
    for (const type of definitionsAst.types) {
      const defMap = await resolveDefinitions({ type, scope }).then(
        ({ definitions }) => definitions
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

    return {
      definitions: results,
      definitionsAst: buildDefinition({ scope, type: definitionsAst }),
    }
  }

  async function resolveNormal(properties: TSProperties) {
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
        ? await resolveTSReferencedType(value.value)
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

    return definitions
  }

  async function resolveDefinitions(
    typeDeclRaw: TSResolvedType<TSType>
  ): Promise<{
    definitions: TSProps['definitions']
    definitionsAst: TSProps['definitionsAst']
  }> {
    let resolved:
      | TSResolvedType
      | TSResolvedType<TSType>
      | TSNamespace
      | undefined = (await resolveTSReferencedType(typeDeclRaw)) || typeDeclRaw

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
        resolved = await resolveTSReferencedType({
          type,
          scope: resolved.scope,
        })
    }

    if (!resolved || isTSNamespace(resolved)) {
      throw new SyntaxError(`Cannot resolve TS definition.`)
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
      if (definitionsAst.type === 'TSTypeReference') {
        throw new SyntaxError(
          `Cannot resolve TS type: ${resolveIdentifier(
            definitionsAst.typeName
          ).join('.')}`
        )
      } else {
        throw new SyntaxError(
          `Cannot resolve TS definition: ${definitionsAst.type}`
        )
      }
    }

    let properties = await resolveTSProperties({
      scope,
      type: definitionsAst,
    })

    if (builtInTypesHandler?.handleTSProperties)
      properties = builtInTypesHandler.handleTSProperties(properties)

    return {
      definitions: await resolveNormal(properties),
      definitionsAst: buildDefinition({ scope, type: definitionsAst }),
    }
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

  function buildNewProp(
    name: string | StringLiteral,
    value: string,
    optional: boolean | undefined
  ) {
    const key = keyToString(name)
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
}

export type Props = /* ReferenceProps | ObjectProps | */ TSProps | undefined

export type DefinePropsStatement = VariableDeclaration | ExpressionStatement
export type DefaultsASTRaw = CallExpression['arguments'][number]

export interface PropsBase {
  declId?: LVal
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
  addProp(
    name: string | StringLiteral,
    type: string,
    optional?: boolean
  ): boolean

  /**
   * Modify a definition of a prop. `definitions` will updated after this call.
   *
   * @limitation Cannot set the prop added by `addProp`.
   *
   * @example setProp('foo', 'string ｜ boolean')
   *
   * @returns false if the definition does not exist.
   */
  setProp(
    name: string | StringLiteral,
    type: string,
    optional?: boolean
  ): boolean

  /**
   * Removes specified prop from TS interface. `definitions` will updated after this call.
   *
   * @limitation Cannot remove prop added by `addProp`. (it will be removed in definitions though)
   *
   * @returns `true` if prop was removed, `false` if prop was not found.
   */
  removeProp(name: string | StringLiteral): boolean

  /**
   * get runtime definitions.
   */
  getRuntimeDefinitions(): Promise<Record<string, RuntimePropDefinition>>
}
