import {
  babelParse,
  isStaticExpression,
  resolveLiteral,
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
  type TSResolvedType,
} from '../ts'
import type { ErrorResolveTS, ErrorUnknownNode } from '../error'
import { DefinitionKind, type ASTDefinition } from './types'
import { attachNodeLoc } from './utils'
import type {
  CallExpression,
  ExpressionStatement,
  LVal,
  Node,
  StringLiteral,
  TSCallSignatureDeclaration,
  TSFunctionType,
  TSInterfaceDeclaration,
  TSIntersectionType,
  TSMappedType,
  TSPropertySignature,
  TSType,
  TSTypeLiteral,
  UnaryExpression,
  VariableDeclaration,
} from '@babel/types'

export function handleTSEmitsDefinition({
  s,
  file,
  offset,

  defineEmitsAst,
  typeDeclRaw,

  declId,
  statement,
}: {
  s: MagicStringAST
  file: TSFile
  sfc: SFC
  offset: number

  defineEmitsAst: CallExpression
  typeDeclRaw: TSType

  statement: DefineEmitsStatement
  declId?: LVal
}): ResultAsync<TSEmits, TransformError<ErrorResolveTS | ErrorUnknownNode>> {
  return safeTry(async function* () {
    const { definitions, definitionsAst } = yield* resolveDefinitions({
      type: typeDeclRaw,
      scope: file,
    })

    const addEmit: TSEmits['addEmit'] = (name, signature) => {
      const key = resolveString(name)

      if (definitionsAst.scope === file) {
        if (definitionsAst.ast.type === 'TSIntersectionType') {
          s.appendLeft(definitionsAst.ast.end! + offset, ` & { ${signature} }`)
        } else {
          s.appendLeft(definitionsAst.ast.end! + offset - 1, `  ${signature}\n`)
        }
      }
      if (!definitions[key]) definitions[key] = []
      const ast = parseSignature(signature)
      definitions[key].push({
        code: signature,
        ast,
        scope: undefined,
      })
    }
    const setEmit: TSEmits['setEmit'] = (name, idx, signature) => {
      const key = resolveString(name)

      const def = definitions[key][idx]
      if (!def) return false

      const ast = parseSignature(signature)
      attachNodeLoc(def.ast, ast)
      if (def.scope === file) s.overwriteNode(def.ast, signature, { offset })

      definitions[key][idx] = {
        code: signature,
        ast,
        scope: undefined,
      }

      return true
    }
    const removeEmit: TSEmits['removeEmit'] = (name, idx) => {
      const key = resolveString(name)

      const def = definitions[key][idx]
      if (!def) return false

      if (def.scope === file) s.removeNode(def.ast, { offset })
      definitions[key].splice(idx, 1)
      return true
    }

    return ok<TSEmits>({
      kind: DefinitionKind.TS,
      definitions,
      definitionsAst,
      declId,
      addEmit,
      setEmit,
      removeEmit,

      statementAst: statement,
      defineEmitsAst,
    })
  })

  function resolveDefinitions(typeDeclRaw: TSResolvedType<TSType>) {
    return safeTry(async function* () {
      const resolved = yield* resolveTSReferencedType(typeDeclRaw)
      if (!resolved || isTSNamespace(resolved))
        return err(new TransformError('Cannot resolve TS definition.'))

      const { type: definitionsAst, scope } = resolved
      if (
        definitionsAst.type !== 'TSInterfaceDeclaration' &&
        definitionsAst.type !== 'TSTypeLiteral' &&
        definitionsAst.type !== 'TSIntersectionType' &&
        definitionsAst.type !== 'TSFunctionType'
      )
        return err(
          new TransformError(
            `Cannot resolve TS definition: ${definitionsAst.type}` as const,
          ),
        )

      const properties = yield* resolveTSProperties({
        scope,
        type: definitionsAst,
      })

      const definitions: TSEmits['definitions'] = Object.create(null)
      for (const signature of properties.callSignatures) {
        const evtArg = signature.type.parameters[0]
        if (
          !evtArg ||
          evtArg.type !== 'Identifier' ||
          evtArg.typeAnnotation?.type !== 'TSTypeAnnotation'
        )
          continue

        const evtType = yield* resolveTSReferencedType({
          type: evtArg.typeAnnotation.typeAnnotation,
          scope: signature.scope,
        })

        if (isTSNamespace(evtType) || !evtType?.type) continue

        const types =
          evtType.type.type === 'TSUnionType'
            ? evtType.type.types
            : [evtType.type]

        for (const type of types) {
          if (type.type !== 'TSLiteralType') continue
          const literal = type.literal
          if (!isStaticExpression(literal)) continue
          const evt = String(
            resolveLiteral(literal as Exclude<typeof literal, UnaryExpression>),
          )
          if (!definitions[evt]) definitions[evt] = []
          definitions[evt].push(buildDefinition(signature))
        }
      }

      for (const evt of Object.keys(properties.properties)) {
        if (!definitions[evt]) definitions[evt] = []
        definitions[evt].push(
          buildDefinition(properties.properties[evt].signature),
        )
      }

      return ok({
        definitions,
        definitionsAst: buildDefinition({ scope, type: definitionsAst }),
      })
    })
  }
}

function parseSignature(signature: string): TSCallSignatureDeclaration {
  return (babelParse(`interface T {${signature}}`, 'ts').body[0] as any).body
    .body[0]
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

export type Emits = TSEmits | undefined

export type DefineEmitsStatement = VariableDeclaration | ExpressionStatement

export interface EmitsBase {
  declId?: LVal
  statementAst: DefineEmitsStatement
  defineEmitsAst: CallExpression
}

export interface TSEmits extends EmitsBase {
  kind: DefinitionKind.TS

  definitions: Record<
    string,
    ASTDefinition<
      | TSCallSignatureDeclaration
      | TSFunctionType
      | TSPropertySignature
      | TSMappedType
    >[]
  >
  definitionsAst: ASTDefinition<
    TSTypeLiteral | TSIntersectionType | TSInterfaceDeclaration | TSFunctionType
  >

  /**
   * Adds a new emit to the definitions. `definitions` will updated after this call.
   *
   * Added definition cannot be set and removed again.
   *
   * @example add('change', '(evt: "change", value: string): void')
   */
  addEmit: (name: string | StringLiteral, signature: string) => void

  /**
   * Modify a definition of a emit. `definitions` will updated after this call.
   *
   * @limitation Cannot set the emit added by `addEmit`.
   *
   * @example setEmit('foo', 0, '(evt: "change", value: string): void')
   *
   * @returns false if the definition does not exist.
   */
  setEmit: (
    name: string | StringLiteral,
    index: number,
    signature: string,
  ) => boolean

  /**
   * Removes specified emit from TS interface. `definitions` will updated after this call.
   *
   * @limitation Cannot remove emit added by `addEmit`. (it will be removed in definitions though)
   *
   * @returns `true` if emit was removed, `false` if emit was not found.
   */
  removeEmit: (name: string | StringLiteral, index: number) => boolean
}
