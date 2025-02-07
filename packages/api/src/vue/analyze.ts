import {
  babelParse,
  DEFINE_EMITS,
  DEFINE_PROPS,
  isCallOf,
  TransformError,
  WITH_DEFAULTS,
  type MagicStringAST,
  type SFC,
} from '@vue-macros/common'
import { err, ok, safeTry, type Result, type ResultAsync } from 'neverthrow'
import type {
  Error,
  ErrorResolveTS,
  ErrorUnknownNode,
  ErrorVueSFC,
  ErrorWithDefaults,
} from '../error'
import type { TSFile } from '../ts'
import { handleTSEmitsDefinition, type Emits } from './emits'
import {
  handleTSPropsDefinition,
  type DefaultsASTRaw,
  type DefinePropsStatement,
  type Props,
} from './props'
import type { CallExpression, LVal, Node } from '@babel/types'

export type { SFC } from '@vue-macros/common'
export { parseSFC } from '@vue-macros/common'

export interface AnalyzeResult {
  props: Props
  emits: Emits
}

export function analyzeSFC(
  s: MagicStringAST,
  sfc: SFC,
): ResultAsync<AnalyzeResult, Error> {
  return safeTry(async function* () {
    if (!sfc.scriptSetup)
      return err(
        new TransformError('<script> is not supported, only <script setup>.'),
      )

    const { scriptSetup } = sfc

    const body = babelParse(
      scriptSetup.content,
      sfc.scriptSetup.lang || 'js',
    ).body

    const offset = scriptSetup.loc.start.offset
    const file: TSFile = {
      kind: 'file',
      filePath: sfc.filename,
      content: scriptSetup.content,
      ast: body,
    }

    let props: Props
    let emits: Emits

    for (const node of body) {
      if (node.type === 'ExpressionStatement') {
        await processDefineProps({
          statement: node,
          defineProps: node.expression,
        })
        yield* (
          await processWithDefaults({
            statement: node,
            withDefaults: node.expression,
          })
        ).safeUnwrap()
        yield* (
          await processDefineEmits({
            statement: node,
            defineEmits: node.expression,
          })
        ).safeUnwrap()
      } else if (node.type === 'VariableDeclaration' && !node.declare) {
        for (const decl of node.declarations) {
          if (!decl.init) continue
          await processDefineProps({
            statement: node,
            defineProps: decl.init,
            declId: decl.id,
          })
          await processWithDefaults({
            statement: node,
            withDefaults: decl.init,
            declId: decl.id,
          })
          await processDefineEmits({
            statement: node,
            defineEmits: decl.init,
            declId: decl.id,
          })
        }
      }
    }

    return ok({
      props,
      emits,
    })

    function processDefineProps({
      defineProps,
      declId,
      statement,

      withDefaultsAst,
      defaultsDeclRaw,
    }: {
      defineProps: Node
      declId?: LVal
      statement: DefinePropsStatement

      withDefaultsAst?: CallExpression
      defaultsDeclRaw?: DefaultsASTRaw
    }): ResultAsync<
      boolean,
      TransformError<ErrorResolveTS | ErrorUnknownNode>
    > {
      return safeTry(async function* () {
        if (!isCallOf(defineProps, DEFINE_PROPS) || props) return ok(false)

        const typeDeclRaw = defineProps.typeParameters?.params[0]
        if (typeDeclRaw) {
          props = yield* (
            await handleTSPropsDefinition({
              s,
              file,
              sfc,
              offset,

              definePropsAst: defineProps,
              typeDeclRaw,

              withDefaultsAst,
              defaultsDeclRaw,

              statement,
              declId,
            })
          ).safeUnwrap()
        } else {
          // TODO: runtime
          return ok(false)
        }

        return ok(true)
      })
    }

    // eslint-disable-next-line require-await
    async function processWithDefaults({
      withDefaults,
      declId,
      statement: stmt,
    }: {
      withDefaults: Node
      declId?: LVal
      statement: DefinePropsStatement
    }): Promise<
      Result<
        boolean,
        TransformError<ErrorWithDefaults | ErrorResolveTS | ErrorUnknownNode>
      >
    > {
      if (!isCallOf(withDefaults, WITH_DEFAULTS)) return ok(false)

      if (!isCallOf(withDefaults.arguments[0], DEFINE_PROPS)) {
        return err(
          new TransformError(
            `${WITH_DEFAULTS}: first argument must be a ${DEFINE_PROPS} call.`,
          ),
        )
      }

      return processDefineProps({
        defineProps: withDefaults.arguments[0],
        declId,
        statement: stmt,
        withDefaultsAst: withDefaults,
        defaultsDeclRaw: withDefaults.arguments[1],
      })
    }

    function processDefineEmits({
      defineEmits,
      declId,
      statement,
    }: {
      defineEmits: Node
      declId?: LVal
      statement: DefinePropsStatement
    }) {
      return safeTry(async function* () {
        if (!isCallOf(defineEmits, DEFINE_EMITS) || emits) return ok(false)

        const typeDeclRaw = defineEmits.typeParameters?.params[0]
        if (typeDeclRaw) {
          emits = yield* (
            await handleTSEmitsDefinition({
              s,
              file,
              sfc,
              offset,

              defineEmitsAst: defineEmits,
              typeDeclRaw,

              statement,
              declId,
            })
          ).safeUnwrap()
        } else {
          // TODO: runtime
          return ok(false)
        }

        return ok(true)
      })
    }
  })
}
