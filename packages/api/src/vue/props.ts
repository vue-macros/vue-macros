import {
  resolveTSProperties,
  resolveTSReferencedDecl,
  resolveTSReferencedType,
} from '../ts'
import { keyToString } from '../utils'
import { DefinitionKind } from './types'
import type { Definition } from './types'
import type { MagicString } from '@vue-macros/common'
import type {
  LVal,
  Node,
  Statement,
  StringLiteral,
  TSInterfaceBody,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeLiteral,
} from '@babel/types'

export function handleTSPropsDefinition({
  s,
  offset,
  body,
  typeDeclRaw,
  declId,
}: {
  s: MagicString
  offset: number
  body: Statement[]
  typeDeclRaw: TSType
  declId?: LVal
}): TSProps {
  const typeDecl = resolveTSReferencedDecl(body, typeDeclRaw)
  if (!typeDecl) throw new SyntaxError(`Cannot resolve TS definition.`)

  const properties = resolveTSProperties(typeDecl)
  const definitions: TSProps['definitions'] = {}
  for (const [key, sign] of Object.entries(properties.methods)) {
    definitions[key] = {
      type: 'method',
      methods: sign.map((sign) => buildDefinition(sign)),
    }
  }

  for (const [key, value] of Object.entries(properties.properties)) {
    const referenced = value.value
      ? resolveTSReferencedType(body, value.value)
      : null
    definitions[key] = {
      type: 'property',
      value: referenced ? buildDefinition(referenced) : null,
      optional: value.optional,
      signature: buildDefinition(value.signature),
    }
  }

  const addRaw: TSProps['addRaw'] = (def) => {
    s.appendLeft(typeDecl.end! + offset - 1, `  ${def}`)
  }

  const overwriteRaw = (
    def: TSPropsMethod | TSPropsProperty,
    signature: string
  ) => {
    switch (def.type) {
      case 'method': {
        s.overwriteNode(def.methods[0].ast!, signature, { offset })
        def.methods
          .slice(1)
          .forEach((method) => s.removeNode(method.ast!, { offset }))
        break
      }
      case 'property': {
        if (!def.signature.ast)
          throw new Error(
            'Cannot overwrite prop definition added by `addProp`.'
          )
        s.overwriteNode(def.signature.ast, signature, { offset })
        break
      }
    }
  }

  const addProp: TSProps['addProp'] = (_key, value, optional) => {
    const key = keyToString(_key)
    const signature = `${_key}${optional ? '?' : ''}: ${value}`

    const def = definitions[key]
    if (!def) {
      addRaw(`${signature};\n`)
    } else {
      // override existing prop definition
      overwriteRaw(def, `${signature};`)
    }

    definitions[key] = {
      type: 'property',
      value: {
        code: value,
      },
      optional: !!optional,
      signature: {
        code: signature,
      },
    }
  }

  const removeProp: TSProps['removeProp'] = (_key) => {
    const key = keyToString(_key)
    if (!definitions[key]) return false

    const def = definitions[key]
    switch (def.type) {
      case 'property':
        if (!def.signature.ast) return false
        s.removeNode(def.signature.ast, { offset })
        break
      case 'method':
        def.methods.forEach((method) => s.removeNode(method.ast!, { offset }))
        break
    }

    return true
  }

  return {
    kind: DefinitionKind.TS,
    definitions,
    definitionsAst: typeDecl,
    declId,
    addProp,
    addRaw,
    removeProp,
  }

  function buildDefinition<T extends Node>(node: T): Definition<T> {
    return {
      code: s.sliceNode(node, { offset }),
      ast: node,
    }
  }
}

export type Props = ReferenceProps | ObjectProps | TSProps | undefined

export interface PropsBase {
  declId: LVal | undefined
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
  value: Definition<TSType | TSInterfaceBody> | null
  optional: boolean
  signature: Definition<TSPropertySignature>
}

export interface TSProps extends PropsBase {
  kind: DefinitionKind.TS

  /** propName -> tsType */
  definitions: Record<string | number, TSPropsMethod | TSPropsProperty>
  definitionsAst: TSTypeLiteral | TSInterfaceBody

  /**
   * Adds a new prop to the definitions. If the definition already exists, it will be overwrote.
   *
   * Added definition cannot be removed and overwrote again.
   *
   * @example add('foo', 'string ｜ boolean')
   */
  addProp(name: string | StringLiteral, type: string, optional?: boolean): void

  /**
   * Add raw defintions to TS interface.
   *
   * @internal not a stable API. `definitions` will NOT updated after this call.
   *
   * @example addRaw('foo: string; bar: number')
   */
  addRaw(definitions: string): void

  /**
   * Removes specified prop from TS interface.
   *
   * `definitions` will updated after this call.
   *
   * Cannot remove prop added by `addProp`.
   *
   * @returns `true` if prop was removed, `false` if prop was not found.
   */
  removeProp(name: string | StringLiteral): boolean
}
