import {
  DEFINE_PROPS,
  DEFINE_PROPS_REFS,
  MagicString,
  WITH_DEFAULTS,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import type { CallExpression, Node } from '@babel/types'

export function transformDefinePropsRefs(code: string, id: string) {
  if (!code.includes(DEFINE_PROPS_REFS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  let changed = false
  // let withDefaultsBody: { node: CallExpression; code: string } | null = null
  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, DEFINE_PROPS_REFS)) {
        processDefinePropsRefs(node)
      }
      if (isCallOf(node, WITH_DEFAULTS)) {
        processDefinePropsRefs(node.arguments[0] as CallExpression, node)
        this.skip()
      }
      // if (
      //   isCallOf(node, WITH_DEFAULTS) &&
      //   node.arguments[1] &&
      //   node.arguments[1].type === 'ObjectExpression'
      // ) {
      //   const exprNode = node.arguments[1]
      //   withDefaultsBody = {
      //     code: code.slice(offset + exprNode.start!, offset + exprNode.end!),
      //     node,
      //   }
      //   return
      // }
      // if (!isCallOf(node, DEFINE_PROPS_REFS)) return
      // const definePropsBody = s.slice(
      //   offset + node.callee.end!,
      //   offset + node.end!
      // )
      // let definePropsCode = ''
      // if (withDefaultsBody) {
      //   definePropsCode = `${WITH_DEFAULTS}(${DEFINE_PROPS}${definePropsBody}, ${withDefaultsBody.code})`
      // } else {
      //   definePropsCode = `${DEFINE_PROPS}${definePropsBody}`
      // }
      // s.prependLeft(offset, `\nconst __MACROS_props = ${definePropsCode}`)
      // s.overwriteNode(
      //   withDefaultsBody ? withDefaultsBody.node : node,
      //   '_MACROS_toRefs(__MACROS_props)',
      //   { offset }
      // )
      // changed = true
    },
  })

  if (changed) {
    s.prependLeft(offset, `\nimport { toRefs as _MACROS_toRefs } from 'vue'`)
  }

  return getTransformResult(s, id)

  function processDefinePropsRefs(
    propsCall: CallExpression,
    defaultsCall?: CallExpression
  ) {
    let code = `defineProps${s.slice(
      offset + propsCall.callee.end!,
      offset + propsCall.end!
    )}`
    if (defaultsCall) {
      code = `withDefaults(${code}, ${s.sliceNode(defaultsCall.arguments[1], {
        offset,
      })})`
    }

    s.prependLeft(offset, `\nconst __MACROS_props = ${code}`)
    s.overwriteNode(
      defaultsCall || propsCall,
      '_MACROS_toRefs(__MACROS_props)',
      { offset }
    )
    changed = true
  }
}
