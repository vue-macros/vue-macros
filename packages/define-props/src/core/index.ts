import {
  DEFINE_PROPS,
  DEFINE_PROPS_DOLLAR,
  MagicString,
  babelParse,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import type { Node } from '@babel/types'

export function transfromDefineProps(code: string, id: string) {
  if (!code.includes(DEFINE_PROPS_DOLLAR)) return

  const { scriptSetup, lang } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const program = babelParse(scriptSetup.loc.source, lang)

  walkAST<Node>(program, {
    enter(node) {
      if (isCallOf(node, DEFINE_PROPS_DOLLAR)) {
        s.overwriteNode(
          node.callee,
          // add space for fixing mapping
          ` ${DEFINE_PROPS}`,
          { offset }
        )
      }
    },
  })

  return getTransformResult(s, id)
}
