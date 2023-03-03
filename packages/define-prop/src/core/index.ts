import {
  HELPER_PREFIX,
  DEFINE_PROP,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
  importHelperFn,
} from '@vue-macros/common'
import type { Node } from '@babel/types'

function formatProp(prop: string) {
  return `'${prop}'`
}

export function transformDefineProps(code: string, id: string) {
  if (!code.includes(DEFINE_PROP)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  const props: string[] = []

  let fistNodeProp: any

  
  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, DEFINE_PROP)) {
        // s.overwriteNode(node.callee, '//test')

        if (!fistNodeProp) {
          fistNodeProp = node
        }

        props.push(node.arguments[0].value)

        
        s.overwriteNode(
          node,
          // add space for fixing mapping
          `${HELPER_PREFIX}computed(() => props.${node.arguments[0].value})`,
          { offset }
        )
      }
    },
  })

  if (props.length) {
    importHelperFn(s, offset, 'computed', 'vue')

    s.prependLeft(offset!, `\n const props = defineProps([${props.map(formatProp).join(',')}])\n`)
  }



  console.log(s, getTransformResult(s, id))

  return getTransformResult(s, id)
}
