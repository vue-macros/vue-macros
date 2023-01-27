import {
  DEFINE_PROPS_REFS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import type { Node } from '@babel/types'

export function transformDefinePropsRefs(code: string, id: string) {
  if (!code.includes(DEFINE_PROPS_REFS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  let changed = false
  walkAST<Node>(setupAst, {
    enter(node) {
      if (!isCallOf(node, DEFINE_PROPS_REFS)) return
      s.prependLeft(
        offset,
        `\nconst __MACROS_props = defineProps${s.slice(
          offset + node.callee.end!,
          offset + node.end!
        )}`
      )
      s.overwriteNode(node, '_MACROS_toRefs(__MACROS_props)', { offset })
      changed = true
    },
  })

  if (changed) {
    s.prependLeft(offset, `\nimport { toRefs as _MACROS_toRefs } from 'vue'`)
  }

  return getTransformResult(s, id)
}
