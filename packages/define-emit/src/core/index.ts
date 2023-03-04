import {
  HELPER_PREFIX,
  DEFINE_EMIT,
  DEFINE_EMITS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
  importHelperFn,
} from '@vue-macros/common'

import type { Node } from '@babel/types'


function mountEmits(emits: string[][]) {
  const isAllWithoutOptions = emits.every(([, options]) => !options)

  if (isAllWithoutOptions) {
    return `[${emits.map(([name]) => `'${name}'`).join(',')}]` 
  }

  return `{
    ${emits.map(([name, options]) => `${name}: ${options || `{}`}`).join(', ')}
  }`
}

export function transformDefineEmit(code: string, id: string) {
  if (!code.includes(DEFINE_EMIT)) return

  if (code.includes(DEFINE_EMITS)) {
    throw new Error(`[${DEFINE_EMIT}] ${DEFINE_EMITS} can not be used with ${DEFINE_EMIT}.`)
  }

  const { scriptSetup, getSetupAst } = parseSFC(code, id)

  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  const emits: string[][] = []

  
  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, DEFINE_EMIT)) {

        let options = undefined

        if (node.arguments[1]) {
          options = code.slice(node.arguments[1].start! + offset, node.arguments[1].end! + offset)
        }

        emits.push([node.arguments[0].value, options])
        
        s.overwriteNode(
          node,
          // add space for fixing mapping
          `${HELPER_PREFIX}emit('${node.arguments[0].value}')`,
          { offset }
        )
      }
    },
  })


  s.prependLeft(offset!, `\n const ${HELPER_PREFIX}emit = defineEmits(${mountEmits(emits)})\n`)  

  return getTransformResult(s, id)
}
