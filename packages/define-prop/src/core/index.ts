import {
  HELPER_PREFIX,
  DEFINE_PROP,
  DEFINE_PROPS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
  importHelperFn,
} from '@vue-macros/common'
import type { Node } from '@babel/types'


function mountProps(props: string[][]) {
  const isAllWithoutOptions = props.every(([, options]) => !options)

  if (isAllWithoutOptions) {
    return `[${props.map(([name]) => `'${name}'`).join(',')}]` 
  }

  return `{
    ${props.map(([name, options]) => `${name}: ${options || `{}`}`).join(', ')}
  }`
}

export const propsVariableName = `${HELPER_PREFIX}_root_props`

export function transformDefineProp(code: string, id: string) {
  if (!code.includes(DEFINE_PROP)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  const props: string[][] = []

  
  
  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, DEFINE_PROP)) {

        let options = undefined

        if (node.arguments[1]) {
          options = code.slice(node.arguments[1].start! + offset, node.arguments[1].end! + offset)
        }


        props.push([node.arguments[0].value, options])

        
        s.overwriteNode(
          node,
          // add space for fixing mapping
          `${HELPER_PREFIX}computed(() => ${propsVariableName}.${node.arguments[0].value})`,
          { offset }
        )
      }
    },
  })

  if (props.length) {
    importHelperFn(s, offset, 'computed', 'vue')

    s.prependLeft(offset!, `\n const ${propsVariableName} = defineProps(${mountProps(props)})\n`)
  }

  return getTransformResult(s, id)
}
