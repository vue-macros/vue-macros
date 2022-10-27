import {
  babelParse,
  isStaticExpression,
  resolveObjectExpression,
} from '@vue-macros/common'
import { resolveTSProperties, resolveTSReferencedType } from '../ts'
import { keyToString } from '../utils'
import { DefinitionKind } from './types'
import { inferRuntimeType } from './utils'
import type { DefinePropsStatement } from './analyze'
import type { MagicString, SFC } from '@vue-macros/common'
import type { TSFile, TSResolvedType } from '../ts'
import type { Definition as TSDefinition } from './types'
import type {
  CallExpression,
  Expression,
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
} from '@babel/types'

export type DefaultsASTRaw = CallExpression['arguments'][number]

export async function handleTSPropsDefinition({
  s,
  file,
  offset,

  typeDeclRaw,
  defaultsDeclRaw,

  definePropsAst,
  withDefaultsAst,

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
  const { definitions, definitionsAst } = await resolveDefinitions(typeDeclRaw)
  const { defaults, defaultsAst } = resolveDefaults(defaultsDeclRaw)

  const addProp: TSProps['addProp'] = (_key, value, optional) => {
    const { key, signature, valueAst, signatureAst } = buildNewProp(
      _key,
      value,
      optional
    )
    if (definitions[key]) return false

    s.appendLeft(definitionsAst.end! + offset - 1, `  ${signature}\n`)

    definitions[key] = {
      type: 'property',
      value: {
        code: value,
        ast: valueAst,
        file: undefined,
      },
      optional: !!optional,
      signature: {
        code: signature,
        ast: signatureAst,
        file: undefined,
      },
      addByAPI: true,
    }
    return true
  }

  const setProp: TSProps['setProp'] = (_key, value, optional) => {
    function attachNodeLoc(node: Node, newNode: Node) {
      newNode.start = node.start
      newNode.end = node.end
    }

    const { key, signature, signatureAst, valueAst } = buildNewProp(
      _key,
      value,
      optional
    )

    const def = definitions[key]
    if (!definitions[key]) return false

    switch (def.type) {
      case 'method': {
        s.overwriteNode(def.methods[0].ast!, signature, { offset })
        attachNodeLoc(def.methods[0].ast!, signatureAst)
        def.methods
          .slice(1)
          .forEach((method) => s.removeNode(method.ast!, { offset }))
        break
      }
      case 'property': {
        if (!def.addByAPI) {
          s.overwriteNode(def.signature.ast, signature, { offset })
        }

        attachNodeLoc(def.signature.ast, signatureAst)
        break
      }
    }

    definitions[key] = {
      type: 'property',
      value: {
        code: value,
        ast: valueAst,
        file: undefined as any,
      },
      optional: !!optional,
      signature: {
        code: signature,
        ast: signatureAst,
        file: undefined as any,
      },
      addByAPI: def.type === 'property' && def.addByAPI,
    }
    return true
  }

  const removeProp: TSProps['removeProp'] = (_key) => {
    const key = keyToString(_key)
    if (!definitions[key]) return false

    const def = definitions[key]
    switch (def.type) {
      case 'property': {
        if (!def.addByAPI && def.signature.file === file) {
          s.removeNode(def.signature.ast, { offset })
        }
        break
      }
      case 'method':
        def.methods.forEach((method) => s.removeNode(method.ast!, { offset }))
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
              file: resolvedType.file || file,
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

  async function resolveDefinitions(typeDeclRaw: TSType) {
    const definitionsAst = (
      await resolveTSReferencedType({ file, type: typeDeclRaw })
    )?.type
    if (
      !definitionsAst ||
      (definitionsAst.type !== 'TSInterfaceDeclaration' &&
        definitionsAst.type !== 'TSTypeLiteral' &&
        definitionsAst.type !== 'TSIntersectionType')
    )
      throw new SyntaxError(`Cannot resolve TS definition.`)

    const properties = await resolveTSProperties({
      file,
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
        value: referenced ? buildDefinition(referenced) : undefined,
        optional: value.optional,
        signature: buildDefinition(value.signature),
      }
    }

    return { definitions, definitionsAst }
  }

  function resolveDefaults(defaultsAst?: DefaultsASTRaw): {
    defaultsAst?: TSProps['defaultsAst']
    defaults?: TSProps['defaults']
  } {
    if (!defaultsAst) return {}

    const isStatic =
      defaultsAst.type === 'ObjectExpression' &&
      isStaticExpression(defaultsAst, {
        array: true,
        object: true,
        objectMethod: true,
        unary: true,
      })
    // TODO check and throw
    if (!isStatic) return { defaultsAst: defaultsAst as Expression }

    const defaults = resolveObjectExpression(defaultsAst)
    if (!defaults) return { defaultsAst }

    return { defaults, defaultsAst }
  }

  function buildNewProp(
    _key: string | StringLiteral,
    value: string,
    optional: boolean | undefined
  ) {
    const key = keyToString(_key)
    const signature = `${_key}${optional ? '?' : ''}: ${value}`

    const valueAst = (babelParse(`type T = (${value})`, 'ts').body[0] as any)
      .typeAnnotation.typeAnnotation

    const signatureAst = (
      babelParse(`interface T {${signature}}`, 'ts').body[0] as any
    ).body.body[0]

    return { key, signature, signatureAst, valueAst }
  }

  function buildDefinition<T extends Node>({
    type,
    file,
  }: {
    type: T
    file: TSFile
  }): TSDefinition<T> {
    return {
      code: file.content.slice(type.start!, type.end!),
      ast: type,
      file,
    }
  }
}

export type Props = /* ReferenceProps | ObjectProps | */ TSProps | undefined

export interface PropsBase {
  declId: LVal | undefined
  statementAst: DefinePropsStatement
  definePropsAst: CallExpression
  withDefaultsAst?: CallExpression
}

// TODO: not implement yet
export interface RuntimeProps extends PropsBase {
  /**
   * @example addProp('foo', 'String')
   * @example addProp('foo', '{ type: String, default: "foo" }')
   */
  addProp(name: string | StringLiteral, definition: string): void

  /**
   * @example addRaw('{ foo: String, bar: Number }')
   */
  addRaw(raw: string): void

  /**
   * Removes specified prop from TS interface.
   *
   * @returns `true` if prop was removed, `false` if prop was not found.
   */
  removeProp(name: string | StringLiteral): boolean
}

export interface ReferenceProps extends RuntimeProps {
  kind: DefinitionKind.Reference
}

export interface ObjectProps extends RuntimeProps {
  kind: DefinitionKind.Object

  /** propName -> definition */
  definitions?: Record<string, string>
}

export interface TSPropsMethod {
  type: 'method'
  methods: TSDefinition<TSMethodSignature>[]
}

export interface TSPropsProperty {
  type: 'property'
  value: TSDefinition<NonNullable<TSResolvedType>['type']> | undefined
  optional: boolean
  signature: TSDefinition<TSPropertySignature>

  /** Whether added by `addProp` API */
  addByAPI: boolean
}

export interface TSProps extends PropsBase {
  kind: DefinitionKind.TS

  definitions: Record<string | number, TSPropsMethod | TSPropsProperty>
  definitionsAst: TSInterfaceDeclaration | TSTypeLiteral | TSIntersectionType

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
   * Adds a new prop to the definitions. If the definition already exists, it will be overwrote.
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
   * Modify a definition of a prop.
   *
   * @limitation Cannot set prop added by `addProp`.
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
   * Removes specified prop from TS interface.
   *
   * `definitions` will updated after this call.
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

export interface RuntimePropDefinition {
  type: string[]
  required: boolean
  default?: (key?: string) => string
}
