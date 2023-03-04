import {
  DEFINE_EMIT,
  HELPER_PREFIX,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'

import type { Node } from '@babel/types'

export const emitVariableName = `${HELPER_PREFIX}_root_emit`

function mountEmits(emits: string[][]) {
  const isAllWithoutOptions = emits.every(([, options]) => !options)

  if (isAllWithoutOptions) {
    return `[${emits.map(([name]) => `'${name}'`).join(', ')}]`
  }

  return `{
    ${emits.map(([name, options]) => `${name}: ${options || `{}`}`).join(', ')}
  }`
}

export function transformDefineEmit(code: string, id: string) {
  if (!code.includes(DEFINE_EMIT)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)

  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  const emits: string[][] = []

  walkAST<Node>(setupAst, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_EMIT)) {
        let options = undefined

        const [name, validataion] = node.arguments as any[]

        if (validataion) {
          options = code.slice(validataion.start! + offset, validataion.end! + offset)
        }

        emits.push([name.value, options])

        s.overwriteNode(
          node,
          // add space for fixing mapping
          `(payload) => ${emitVariableName}('${name.value}', payload)`,
          { offset }
        )
      }
    },
  })

  if (emits.length > 0) {
    s.prependLeft(
      offset!,
      `\n const ${emitVariableName} = defineEmits(${mountEmits(emits)})\n`
    )
  }

  return getTransformResult(s, id)
}
