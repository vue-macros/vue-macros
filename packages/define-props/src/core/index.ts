import {
  DEFINE_PROPS,
  DEFINE_PROPS_DOLLAR,
  generateTransform,
  isCallOf,
  MagicStringAST,
  parseSFC,
  walkAST,
  type CodeTransform,
} from '@vue-macros/common'
import type { Node } from '@babel/types'

export function transformDefineProps(
  code: string,
  id: string,
): CodeTransform | undefined {
  if (!code.includes(DEFINE_PROPS_DOLLAR)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicStringAST(code)
  const setupAst = getSetupAst()!

  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, DEFINE_PROPS_DOLLAR)) {
        s.overwriteNode(
          node.callee,
          // add space for fixing mapping
          ` ${DEFINE_PROPS}`,
          { offset },
        )
      }
    },
  })

  return generateTransform(s, id)
}
