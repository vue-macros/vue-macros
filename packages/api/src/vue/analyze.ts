import {
  DEFINE_EMITS,
  DEFINE_PROPS,
  WITH_DEFAULTS,
  babelParse,
  isCallOf,
} from '@vue-macros/common'
import { handleTSPropsDefinition } from './props'
import { handleTSEmitsDefinition } from './emits'
import type { TSFile } from '../ts'
import type { Emits } from './emits'
import type { DefaultsASTRaw, DefinePropsStatement, Props } from './props'
import type { MagicString, SFC } from '@vue-macros/common'
import type { CallExpression, LVal, Node } from '@babel/types'

export type { SFC } from '@vue-macros/common'
export { parseSFC } from '@vue-macros/common'

export interface AnalyzeResult {
  props: Props
  emits: Emits
}

export async function analyzeSFC(
  s: MagicString,
  sfc: SFC
): Promise<AnalyzeResult> {
  if (!sfc.scriptSetup) throw new Error('Only <script setup> is supported')

  const { scriptSetup } = sfc

  const body = babelParse(
    scriptSetup.content,
    sfc.scriptSetup.lang || 'js'
  ).body

  const offset = scriptSetup.loc.start.offset
  const file: TSFile = {
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
      await processWithDefaults({
        statement: node,
        withDefaults: node.expression,
      })
      await processDefineEmits({
        statement: node,
        defineEmits: node.expression,
      })
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

  return {
    props,
    emits,
  }

  async function processDefineProps({
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
  }) {
    if (!isCallOf(defineProps, DEFINE_PROPS) || props) return false

    const typeDeclRaw = defineProps.typeParameters?.params[0]
    if (typeDeclRaw) {
      props = await handleTSPropsDefinition({
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
    } else {
      // TODO: runtime
      return false
    }

    return true
  }

  async function processWithDefaults({
    withDefaults,
    declId,
    statement: stmt,
  }: {
    withDefaults: Node
    declId?: LVal
    statement: DefinePropsStatement
  }): Promise<boolean> {
    if (!isCallOf(withDefaults, WITH_DEFAULTS)) return false

    if (!isCallOf(withDefaults.arguments[0], DEFINE_PROPS)) {
      throw new SyntaxError(
        `${WITH_DEFAULTS}: first argument must be a ${DEFINE_PROPS} call.`
      )
    }

    const isDefineProps = await processDefineProps({
      defineProps: withDefaults.arguments[0],
      declId,
      statement: stmt,
      withDefaultsAst: withDefaults,
      defaultsDeclRaw: withDefaults.arguments[1],
    })
    if (!isDefineProps) return false

    return true
  }

  async function processDefineEmits({
    defineEmits,
    declId,
    statement,
  }: {
    defineEmits: Node
    declId?: LVal
    statement: DefinePropsStatement
  }) {
    if (!isCallOf(defineEmits, DEFINE_EMITS) || emits) return false

    const typeDeclRaw = defineEmits.typeParameters?.params[0]
    if (typeDeclRaw) {
      emits = await handleTSEmitsDefinition({
        s,
        file,
        sfc,
        offset,

        defineEmitsAst: defineEmits,
        typeDeclRaw,

        statement,
        declId,
      })
    } else {
      // TODO: runtime
      return false
    }

    return true
  }
}
