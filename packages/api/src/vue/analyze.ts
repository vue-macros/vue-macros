import { DEFINE_PROPS, isCallOf } from '@vue-macros/common'
import { handleTSDefinition } from './props'
import type { Props } from './props'
import type { MagicString, SFC } from '@vue-macros/common'
import type { LVal, Node } from '@babel/types'

export type { SFC } from '@vue-macros/common'
export { parseSFC } from '@vue-macros/common'

export interface AnalyzeResult {
  props: Props
}

export function analyzeSFC(s: MagicString, sfc: SFC) {
  if (sfc.script || !sfc.scriptSetup)
    throw new Error('Only <script setup> is supported')

  const { scriptSetup, scriptCompiled } = sfc
  if (!scriptCompiled.scriptSetupAst)
    throw new Error('Cannot parse <script setup>.')

  const offset = scriptSetup.loc.start.offset
  const body = scriptCompiled.scriptSetupAst

  let props: AnalyzeResult['props'] | undefined

  for (const node of body) {
    if (node.type === 'ExpressionStatement') {
      processDefineProps(node.expression)
    } else if (node.type === 'VariableDeclaration' && !node.declare) {
      for (const decl of node.declarations) {
        if (!decl.init) continue
        processDefineProps(decl.init, decl.id)
      }
    }
  }

  return {
    props,
  }

  function processDefineProps(node: Node, declId?: LVal) {
    if (!isCallOf(node, DEFINE_PROPS) || props) return false

    const typeDeclRaw = node.typeParameters?.params[0]
    if (typeDeclRaw) {
      props = handleTSDefinition({ s, offset, body, typeDeclRaw, declId })
    } else {
      throw new Error('Only TS definition is supported')
    }

    // if (declId) {
    //   if (type === 'props' && declId.type === 'ObjectPattern') {
    //     propsDestructureDecl = declId
    //   } else if (type === 'emits' && declId.type === 'Identifier') {
    //     emitsIdentifier = declId.name
    //   }
    // } else if (type === 'emits') {
    //   emitsIdentifier = `_${DEFINE_MODEL}_emit`
    //   s.prependRight(setupOffset + node.start!, `const ${emitsIdentifier} = `)
    // }

    return true
  }
}
