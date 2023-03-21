import { DEFINE_EMIT, isCallOf, walkAST } from '@vue-macros/common'
import { EMIT_VARIABLE_NAME } from './constants'
import type { TransformOptions } from './options'
import type { Node } from '@babel/types'

interface Emit {
  name: string
  validator?: string
}

function mountEmits(emits: Emit[]) {
  const isAllWithoutOptions = emits.every(({ validator }) => !validator)

  if (isAllWithoutOptions) {
    return `[${emits.map(({ name }) => JSON.stringify(name)).join(', ')}]`
  }

  return `{
      ${emits
        .map(
          ({ name, validator }) =>
            `${JSON.stringify(name)}: ${validator || `null`}`
        )
        .join(', ')}
    }`
}

export function transformDefineEmit({ setupAst, offset, s }: TransformOptions) {
  const emits: Emit[] = []

  walkAST<Node>(setupAst, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_EMIT)) {
        const [name, validator] = node.arguments

        if (name.type !== 'StringLiteral') {
          throw new Error(
            `The first argument of ${DEFINE_EMIT} must be a string literal.`
          )
        }

        emits.push({
          name: name.value,
          validator: validator ? s.sliceNode(validator, { offset }) : undefined,
        })

        s.overwriteNode(
          node,
          `(...args) => ${EMIT_VARIABLE_NAME}(${JSON.stringify(
            name.value
          )}, ...args)`,
          { offset }
        )
      }
    },
  })

  if (emits.length > 0) {
    s.prependLeft(
      offset!,
      `\nconst ${EMIT_VARIABLE_NAME} = defineEmits(${mountEmits(emits)})\n`
    )
  }
}
