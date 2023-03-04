import {
  DEFINE_PROP,
  HELPER_PREFIX,
  MagicString,
  getTransformResult,
  importHelperFn,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import type { Node } from '@babel/types'

function mountProps(props: string[][]) {
  const isAllWithoutOptions = props.every(([, options]) => !options)

  if (isAllWithoutOptions) {
    return `[${props.map(([name]) => `'${name}'`).join(', ')}]`
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
    enter(node: Node) {
      if (isCallOf(node, DEFINE_PROP)) {
        let options = undefined

        const [name, definition] = node.arguments as any[]

        if (definition) {
          options = code.slice(definition.start! + offset, definition.end! + offset)
        }

        props.push([name.value, options])

        s.overwriteNode(
          node,
          // add space for fixing mapping
          `${HELPER_PREFIX}computed(() => ${propsVariableName}.${name.value})`,
          { offset }
        )
      }
    },
  })

  if (props.length > 0) {
    importHelperFn(s, offset, 'computed', 'vue')

    s.prependLeft(
      offset!,
      `\n const ${propsVariableName} = defineProps(${mountProps(props)})\n`
    )
  }

  return getTransformResult(s, id)
}
