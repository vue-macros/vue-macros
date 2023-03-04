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

export const emitVariableName = `${HELPER_PREFIX}_root_emit`


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
          `(payload) => ${emitVariableName}('${node.arguments[0].value}', payload)`,
          { offset }
        )
      }
    },
  })

  if (emits.length) {
    s.prependLeft(offset!, `\n const ${emitVariableName} = defineEmits(${mountEmits(emits)})\n`)
  }



  return getTransformResult(s, id)
}
