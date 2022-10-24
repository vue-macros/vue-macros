import { babelParse } from '@vue-macros/common'
import { resolveTSProperties, resolveTSReferencedType } from '../ts'
import { keyToString } from '../utils'
import { DefinitionKind } from './types'
import { inferRuntimeType } from './utils'
import type { DefinePropsStatement } from './analyze'
import type { MagicString, SFC } from '@vue-macros/common'
import type { TSFile, TSResolvedType } from '../ts'
import type { Definition } from './types'
import type {
  CallExpression,
  LVal,
  Node,
  Statement,
  StringLiteral,
  TSInterfaceDeclaration,
  TSIntersectionType,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeLiteral,
} from '@babel/types'

export async function handleTSPropsDefinition({
  s,
  file,
  offset,
  typeDeclRaw,
  statement,
  callExpression,
  declId,
}: {
  s: MagicString
  file: TSFile
  sfc: SFC
  offset: number
  typeDeclRaw: TSType
  callExpression: CallExpression
  statement: DefinePropsStatement
  declId?: LVal
}): Promise<TSProps> {
  const typeDecl = await resolveTSReferencedType(file, typeDeclRaw)
  if (
    !typeDecl ||
    (typeDecl.type !== 'TSInterfaceDeclaration' &&
      typeDecl.type !== 'TSTypeLiteral' &&
      typeDecl.type !== 'TSIntersectionType')
  )
    throw new SyntaxError(`Cannot resolve TS definition.`)

  const properties = await resolveTSProperties(file, typeDecl)
  const definitions: TSProps['definitions'] = {}
  for (const [key, sign] of Object.entries(properties.methods)) {
    definitions[key] = {
      type: 'method',
      methods: sign.map((sign) => buildDefinition(sign)),
    }
  }

  for (const [key, value] of Object.entries(properties.properties)) {
    const referenced = value.value
      ? await resolveTSReferencedType(file, value.value)
      : undefined
    definitions[key] = {
      type: 'property',
      addByAPI: false,
      value: referenced ? buildDefinition(referenced) : undefined,
      optional: value.optional,
      signature: buildDefinition(value.signature),
    }
  }

  const addProp: TSProps['addProp'] = (_key, value, optional) => {
    const { key, signature, valueAst, signatureAst } = buildNewProp(
      _key,
      value,
      optional
    )
    if (definitions[key]) return false

    s.appendLeft(typeDecl.end! + offset - 1, `  ${signature}\n`)

    definitions[key] = {
      type: 'property',
      value: {
        code: value,
        ast: valueAst,
      },
      optional: !!optional,
      signature: {
        code: signature,
        ast: signatureAst,
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
      },
      optional: !!optional,
      signature: {
        code: signature,
        ast: signatureAst,
      },
      addByAPI: false,
    }
    return true
  }

  const removeProp: TSProps['removeProp'] = (_key) => {
    const key = keyToString(_key)
    if (!definitions[key]) return false

    const def = definitions[key]
    switch (def.type) {
      case 'property': {
        if (!def.addByAPI) {
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
        prop = { type: ['Function'], required: true }
      } else {
        const resolvedType = def.value?.ast
        if (resolvedType) {
          prop = {
            type: await inferRuntimeType(file, resolvedType),
            required: !def.optional,
          }
        } else {
          prop = { type: ['null'], required: false }
        }
      }
      props[propName] = prop
    }
    return props
  }

  return {
    kind: DefinitionKind.TS,
    definitions,
    definitionsAst: typeDecl,
    declId,
    addProp,
    setProp,
    removeProp,
    getRuntimeDefinitions,

    // AST
    statementAst: statement,
    callExpressionAst: callExpression,
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

  function buildDefinition<T extends Node>(node: T): Definition<T> {
    return {
      code: s.sliceNode(node, { offset }),
      ast: node,
    }
  }
}

export type Props = /* ReferenceProps | ObjectProps | */ TSProps | undefined

export interface PropsBase {
  declId: LVal | undefined
  statementAst: Statement
  callExpressionAst: CallExpression
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
  methods: Definition<TSMethodSignature>[]
}

export interface TSPropsProperty {
  type: 'property'
  value: Definition<TSResolvedType> | undefined
  optional: boolean
  signature: Definition<TSPropertySignature>

  /** Whether added by `addProp` API */
  addByAPI: boolean
}

export interface TSProps extends PropsBase {
  kind: DefinitionKind.TS

  /** propName -> tsType */
  definitions: Record<string | number, TSPropsMethod | TSPropsProperty>
  definitionsAst: TSInterfaceDeclaration | TSTypeLiteral | TSIntersectionType

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
   * @limitation Cannot remove prop added by `addProp`.
   *
   * @returns `true` if prop was removed, `false` if prop was not found.
   */
  removeProp(name: string | StringLiteral): boolean

  /**
   * Generate runtime definitions.
   */
  getRuntimeDefinitions(): Promise<Record<string, RuntimePropDefinition>>
}

export interface RuntimePropDefinition {
  type: string[]
  required: boolean
}
