import {
  DEFINE_PROPS,
  MagicString,
  babelParse,
  isStaticObjectKey,
  resolveObjectExpression,
} from '@vue-macros/common'
import {
  getResolvedTypeCode,
  isTSExports,
  resolveTSProperties,
  resolveTSReferencedType,
} from '../ts'
import { keyToString } from '../utils'
import { DefinitionKind } from './types'
import { attachNodeLoc, inferRuntimeType } from './utils'
import type { SFC } from '@vue-macros/common'
import type { TSFile, TSResolvedType } from '../ts'
import type { ASTDefinition } from './types'
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
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeLiteral,
  VariableDeclaration,
} from '@babel/types'

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
    const { key, signature, valueString, valueAst, signatureAst } =
      buildNewProp(name, value, optional)
    if (definitions[key]) return false

    if (definitionsAst.scope === file) {
      if (definitionsAst.ast.type === 'TSIntersectionType') {
        s.appendLeft(definitionsAst.ast.end! + offset, ` & { ${signature} }`)
      } else {
        s.appendLeft(definitionsAst.ast.end! + offset - 1, `\n  ${signature}`)
      }
    }

    definitions[key] = {
      type: 'property',
      value: value
        ? {
            code: valueString!,
            ast: valueAst!,
            scope: undefined,
          }
        : undefined,
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
    const { key, signature, signatureAst, valueString, valueAst } =
      buildNewProp(name, value, optional)

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
      value: value
        ? {
            code: valueString!,
            ast: valueAst!,
            scope: undefined as any,
          }
        : undefined,
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
    const props: Record<string, RuntimePropDefinition> = {}

    for (const [propName, def] of Object.entries(definitions)) {
      let prop: RuntimePropDefinition
      if (def.type === 'method') {
        prop = {
          type: ['Function'],
          required: true,
        }
      } else {
        const resolvedType = def.value
        if (resolvedType) {
          prop = {
            type: await inferRuntimeType({
              scope: resolvedType.scope || file,
              type: resolvedType.ast,
            }),
            required: !def.optional,
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
              }${defaultValue.async ? `async ` : ''}${key}(${s.sliceNodes(
                defaultValue.params,
                {
                  offset,
                }
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

  async function resolveDefinitions(
    typeDeclRaw: TSResolvedType<TSType>
  ): Promise<{
    definitions: TSProps['definitions']
    definitionsAst: TSProps['definitionsAst']
  }> {
    const resolved = await resolveTSReferencedType(typeDeclRaw)
    if (!resolved || isTSExports(resolved))
      throw new SyntaxError(`Cannot resolve TS definition.`)

    const { type: definitionsAst, scope } = resolved
    if (
      definitionsAst.type !== 'TSInterfaceDeclaration' &&
      definitionsAst.type !== 'TSTypeLiteral' &&
      definitionsAst.type !== 'TSIntersectionType'
    )
      throw new SyntaxError(`Cannot resolve TS definition.`)

    const properties = await resolveTSProperties({
      scope,
      type: definitionsAst,
    })

    const definitions: TSProps['definitions'] = {}
    for (const [key, sign] of Object.entries(properties.methods)) {
      definitions[key] = {
        type: 'method',
        methods: sign.map((sign) => buildDefinition(sign)),
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
          referenced && !isTSExports(referenced)
            ? buildDefinition(referenced)
            : undefined,
        optional: value.optional,
        signature: buildDefinition(value.signature),
      }
    }

    return {
      definitions,
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
    value: string | TSResolvedType | null | undefined,
    optional: boolean | undefined
  ) {
    const key = keyToString(name)

    let signature = JSON.stringify(typeof name === 'string' ? name : name.value)

    let valueString: string | undefined
    let valueAst: TSResolvedType['type'] | undefined
    if (value) {
      if (typeof value === 'string') {
        valueString = value
        valueAst = (babelParse(`type T = (${value})`, 'ts').body[0] as any)
          .typeAnnotation.typeAnnotation
      } else {
        const def = buildDefinition(value)
        valueString = def.code
        valueAst = def.ast
      }
      signature += `${optional ? '?' : ''}: ${valueString}`
    }

    const signatureAst = (
      babelParse(`interface T {${signature}}`, 'ts').body[0] as any
    ).body.body[0]

    return {
      key,
      signature,
      valueString,
      signatureAst,
      valueAst,
    }
  }

  function buildDefinition<T extends Node>({
    type,
    scope,
  }: TSResolvedType<T>): ASTDefinition<T> {
    return {
      code: getResolvedTypeCode({ type, scope }),
      ast: type,
      scope,
    }
  }
}

export function getEmptyProps({
  s,
  file,
  sfc,
  offset,
}: {
  s: MagicString
  file: TSFile
  sfc: SFC
  offset: number
}): EmptyProps {
  const getPlaceholder = async () => {
    const endOffset = sfc.scriptSetup!.loc.end.offset
    const propsStart =
      sfc.scriptSetup!.loc.source.length + `\n${DEFINE_PROPS}<`.length
    const propsEnd = propsStart + 2
    const src = s.toString()
    const newSrc = `${src.slice(
      0,
      endOffset
    )}\n${DEFINE_PROPS}<{}>()${src.slice(endOffset)}`

    const newString = new MagicString(newSrc)
    const result = await handleTSPropsDefinition({
      s: newString,
      file,
      sfc,
      offset,
      typeDeclRaw: {
        type: 'TSTypeLiteral',
        members: [],
        start: propsStart,
        end: propsEnd,
      },

      definePropsAst: undefined as any,
      statement: undefined as any,
    })

    return {
      ...result,
      apply: () => {
        s.appendLeft(
          offset,
          `\n${DEFINE_PROPS}<${newString.slice(
            propsStart + offset,
            propsEnd + offset
          )}>()`
        )
      },
    }
  }

  return {
    kind: DefinitionKind.Empty,
    getPlaceholder,
  }
}

export type Props = /* ReferenceProps | ObjectProps | */ TSProps | EmptyProps

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
}

export interface TSPropsProperty {
  type: 'property'
  value: ASTDefinition<TSResolvedType['type']> | undefined
  optional: boolean
  signature: ASTDefinition<TSPropertySignature>

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
    TSInterfaceDeclaration | TSTypeLiteral | TSIntersectionType
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
    type?: string | TSResolvedType | null,
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
    type?: string | TSResolvedType | null,
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

export interface EmptyProps {
  kind: DefinitionKind.Empty
  getPlaceholder(
    kind: DefinitionKind.TS
  ): Promise<
    Omit<TSProps, 'definePropsAst' | 'statementAst'> & { apply(): void }
  >
}
