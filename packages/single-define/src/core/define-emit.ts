import { DEFINE_EMIT, isCallOf, walkAST } from '@vue-macros/common'

import { type TransformOptions } from './options'

import { EMIT_VARIABLE_NAME } from './constants'
import type { Node } from '@babel/types'

function mountEmits(emits: string[][]) {
  const isAllWithoutOptions = emits.every(([, options]) => !options)

  if (isAllWithoutOptions) {
    return `[${emits.map(([name]) => `'${name}'`).join(', ')}]`
  }

  return `{
      ${emits
        .map(([name, options]) => `${name}: ${options || `{}`}`)
        .join(', ')}
    }`
}

export function transformDefineEmit({
  setupAst,
  code,
  offset,
  magicString,
}: TransformOptions) {
  const emits: string[][] = []

  walkAST<Node>(setupAst, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_EMIT)) {
        let options = undefined

        const [name, validataion] = node.arguments as any[]

        if (validataion) {
          options = code.slice(
            validataion.start! + offset,
            validataion.end! + offset
          )
        }

        emits.push([name.value, options])

        magicString.overwriteNode(
          node,
          // add space for fixing mapping
          `(payload) => ${EMIT_VARIABLE_NAME}('${name.value}', payload)`,
          { offset }
        )
      }
    },
  })

  if (emits.length > 0) {
    magicString.prependLeft(
      offset!,
      `\n const ${EMIT_VARIABLE_NAME} = defineEmits(${mountEmits(emits)})\n`
    )
  }
}
