import {
  DEFINE_PROP,
  HELPER_PREFIX,
  importHelperFn,
  isCallOf,
  walkAST,
} from '@vue-macros/common'
import { type TransformOptions } from './options'
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

export function transformDefineProp({
  setupAst,
  code,
  offset,
  magicString,
}: TransformOptions) {
  const props: string[][] = []

  walkAST<Node>(setupAst, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_PROP)) {
        let options = undefined

        const [name, definition] = node.arguments as any[]

        if (definition) {
          options = code.slice(
            definition.start! + offset,
            definition.end! + offset
          )
        }

        props.push([name.value, options])

        magicString.overwriteNode(
          node,
          // add space for fixing mapping
          `${HELPER_PREFIX}computed(() => ${propsVariableName}.${name.value})`,
          { offset }
        )
      }
    },
  })

  if (props.length > 0) {
    importHelperFn(magicString, offset, 'computed', 'vue')

    magicString.prependLeft(
      offset!,
      `\n const ${propsVariableName} = defineProps(${mountProps(props)})\n`
    )
  }
}
