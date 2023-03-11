import {
  DEFINE_PROP,
  HELPER_PREFIX,
  importHelperFn,
  isCallOf,
  walkAST,
} from '@vue-macros/common'
import { PROPS_VARIABLE_NAME } from './constants'
import type { TransformOptions } from './options'
import type { Node } from '@babel/types'

type Props = [name: string, definition?: string][]

function mountProps(props: Props) {
  const isAllWithoutOptions = props.every(([, options]) => !options)

  if (isAllWithoutOptions) {
    return `[${props.map(([name]) => `'${name}'`).join(', ')}]`
  }

  return `{
    ${props
      .map(([name, options]) => `${name}: ${options || '{}'}`)
      .join(',\n  ')}
  }`
}

export function transformDefineProp({ setupAst, offset, s }: TransformOptions) {
  const props: Props = []

  walkAST<Node>(setupAst, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_PROP)) {
        const [name, definition] = node.arguments

        if (name.type !== 'StringLiteral') {
          throw new Error(
            `The first argument of ${DEFINE_PROP} must be a string literal.`
          )
        }

        props.push([
          name.value,
          definition ? s.sliceNode(definition, { offset }) : undefined,
        ])

        s.overwriteNode(
          node,
          `${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}[${JSON.stringify(
            name.value
          )}])`,
          { offset }
        )
      }
    },
  })

  if (props.length > 0) {
    importHelperFn(s, offset, 'computed', 'vue')

    s.prependLeft(
      offset!,
      `\nconst ${PROPS_VARIABLE_NAME} = defineProps(${mountProps(props)})\n`
    )
  }
}
