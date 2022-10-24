import { isStaticExpression, resolveLiteral } from '@vue-macros/common'
import { resolveTSProperties, resolveTSReferencedType } from '../ts'
import { DefinitionKind } from './types'
import type { TSFile } from '../ts'
import type { MagicString } from '@vue-macros/common'
import type { Definition } from './types'
import type {
  LVal,
  Node,
  StringLiteral,
  TSCallSignatureDeclaration,
  TSInterfaceDeclaration,
  TSType,
  TSTypeLiteral,
} from '@babel/types'

export async function handleTSEmitsDefinition({
  s,
  file,
  offset,
  typeDeclRaw,
  declId,
}: {
  s: MagicString
  file: TSFile
  offset: number
  typeDeclRaw: TSType
  declId?: LVal
}): Promise<TSEmits> {
  const typeDecl = await resolveTSReferencedType(file, typeDeclRaw)
  if (
    !typeDecl ||
    (typeDecl.type !== 'TSInterfaceDeclaration' &&
      typeDecl.type !== 'TSTypeLiteral')
  )
    throw new SyntaxError(`Cannot resolve TS definition.`)

  const properties = await resolveTSProperties(file, typeDecl)
  const definitions: TSEmits['definitions'] = {}

  for (const sign of properties.callSignatures) {
    const evtArg = sign.parameters[0]
    if (
      !evtArg ||
      evtArg.type !== 'Identifier' ||
      evtArg.typeAnnotation?.type !== 'TSTypeAnnotation' ||
      evtArg.typeAnnotation.typeAnnotation.type !== 'TSLiteralType'
    )
      continue

    const literal = evtArg.typeAnnotation.typeAnnotation.literal
    if (!isStaticExpression(literal) || literal.type === 'UnaryExpression')
      continue

    const evt = String(resolveLiteral(literal))
    if (!definitions[evt]) definitions[evt] = []
    definitions[evt].push(buildDefinition(sign))
  }

  const addEmit: TSEmits['addEmit'] = (name, definition) => {}
  const addRaw: TSEmits['addRaw'] = (definitions) => {}
  const removeEmit: TSEmits['removeEmit'] = (name) => {
    return true
  }

  return {
    kind: DefinitionKind.TS,
    definitions,
    definitionsAst: typeDecl,
    declId,
    addEmit,
    addRaw,
    removeEmit,
  }

  function buildDefinition<T extends Node>(node: T): Definition<T> {
    return {
      code: s.sliceNode(node, { offset }),
      ast: node,
    }
  }
}

export type Emits = TSEmits | undefined

export interface EmitsBase {
  declId: LVal | undefined
}

export interface TSEmits extends EmitsBase {
  kind: DefinitionKind.TS

  /** emitName -> tsType */
  definitions: Record<string, Definition<TSCallSignatureDeclaration>[]>
  definitionsAst: TSTypeLiteral | TSInterfaceDeclaration

  /**
   * Adds a new emit to the definitions. If the definition already exists, it will be overwrote.
   *
   * Added definition cannot be removed and overwrote again.
   *
   * @example add('change', '(evt: "change", value: string): void')
   */
  addEmit(name: string | StringLiteral, definition: string): void

  /**
   * Add raw defintions to TS interface.
   *
   * @internal not a stable API. `definitions` will NOT updated after this call.
   *
   * @example addRaw('(evt: "change", value: string): void')
   */
  addRaw(definitions: string): void

  /**
   * Removes specified emit from TS interface.
   *
   * `definitions` will updated after this call.
   *
   * Cannot remove emit added by `addEmit`.
   *
   * @returns `true` if emit was removed, `false` if emit was not found.
   */
  removeEmit(name: string | StringLiteral): boolean
}
