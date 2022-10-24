import { DEFINE_EMITS, DEFINE_PROPS, isCallOf } from '@vue-macros/common'
import { handleTSPropsDefinition } from './props'
import { handleTSEmitsDefinition } from './emits'
import type { TSFile } from '../ts'
import type { Emits } from './emits'
import type { Props } from './props'
import type { MagicString, SFC } from '@vue-macros/common'
import type { LVal, Node } from '@babel/types'

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
  if (sfc.script || !sfc.scriptSetup)
    throw new Error('Only <script setup> is supported')

  const { scriptSetup, scriptCompiled } = sfc
  if (!scriptCompiled.scriptSetupAst)
    throw new Error('Cannot parse <script setup>.')

  const offset = scriptSetup.loc.start.offset
  const body = scriptCompiled.scriptSetupAst
  const file: TSFile = {
    filePath: sfc.filename,
    content: s.original,
    ast: sfc.scriptCompiled.scriptSetupAst!,
  }

  let props: Props
  let emits: Emits

  for (const node of body) {
    if (node.type === 'ExpressionStatement') {
      await processDefineProps(node.expression)
      await processDefineEmits(node.expression)
    } else if (node.type === 'VariableDeclaration' && !node.declare) {
      for (const decl of node.declarations) {
        if (!decl.init) continue
        await processDefineProps(decl.init, decl.id)
        await processDefineEmits(decl.init, decl.id)
      }
    }
  }

  return {
    props,
    emits,
  }

  async function processDefineProps(node: Node, declId?: LVal) {
    if (!isCallOf(node, DEFINE_PROPS) || props) return false

    const typeDeclRaw = node.typeParameters?.params[0]
    if (typeDeclRaw) {
      props = await handleTSPropsDefinition({
        s,
        file,
        sfc,
        offset,
        typeDeclRaw,
        declId,
      })
    } else {
      throw new Error('Runtime definition is not supported yet.')
    }

    return true
  }

  async function processDefineEmits(node: Node, declId?: LVal) {
    if (!isCallOf(node, DEFINE_EMITS) || emits) return false

    const typeDeclRaw = node.typeParameters?.params[0]
    if (typeDeclRaw) {
      emits = await handleTSEmitsDefinition({
        s,
        file,
        offset,
        typeDeclRaw,
        declId,
      })
    } else {
      throw new Error('Runtime definition is not supported yet.')
    }

    return true
  }
}
