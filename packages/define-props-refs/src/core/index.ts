import {
  DEFINE_PROPS,
  DEFINE_PROPS_REFS,
  HELPER_PREFIX,
  MagicString,
  WITH_DEFAULTS,
  getTransformResult,
  importHelperFn,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import { type CallExpression, type Node } from '@babel/types'

export function transformDefinePropsRefs(code: string, id: string) {
  if (!code.includes(DEFINE_PROPS_REFS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, WITH_DEFAULTS) && node.arguments) {
        processDefinePropsRefs(node.arguments[0] as CallExpression, node)
        this.skip()
      } else if (isCallOf(node, DEFINE_PROPS_REFS)) {
        processDefinePropsRefs(node)
      }
    },
  })

  return getTransformResult(s, id)

  function processDefinePropsRefs(
    propsCall: CallExpression,
    defaultsCall?: CallExpression
  ) {
    let code = `${DEFINE_PROPS}${s.slice(
      offset + propsCall.callee.end!,
      offset + propsCall.end!
    )}`
    if (defaultsCall) {
      code = `${WITH_DEFAULTS}(${code}, ${s.sliceNode(
        defaultsCall.arguments[1],
        {
          offset,
        }
      )})`
    }

    s.prependLeft(offset, `\nconst ${HELPER_PREFIX}props = ${code}`)
    s.overwriteNode(
      defaultsCall || propsCall,
      `${importHelperFn(s, offset, 'toRefs')}(${HELPER_PREFIX}props)`,
      {
        offset,
      }
    )
  }
}
