import {
  DEFINE_PROP,
  DEFINE_PROPS,
  HELPER_PREFIX,
  MagicString,
  getTransformResult,
  importHelperFn,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import { inferRuntimeType, resolveTSReferencedType } from '@vue-macros/api'
import { type Node, type TSType } from '@babel/types'
import { kevinEdition } from './kevin-edition'
import { johnsonEdition } from './johnson-edition'

export * from './utils'
export * from './kevin-edition'
export * from './johnson-edition'

export const PROPS_VARIABLE_NAME = `${HELPER_PREFIX}props`
export type Edition = 'kevinEdition' | 'johnsonEdition'

export async function transformDefineProp(
  code: string,
  id: string,
  edition: Edition = 'kevinEdition',
  isProduction = false
) {
  if (!code.includes(DEFINE_PROP)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const setupAst = getSetupAst()!

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)

  const { walkCall, genRuntimeProps } = (
    edition === 'kevinEdition' ? kevinEdition : johnsonEdition
  )({ s, offset, resolveTSType })

  let hasDefineProps = false
  let hasDefineProp = false
  walkAST<Node>(setupAst, {
    enter(node: Node, parent: Node) {
      if (isCallOf(node, DEFINE_PROP)) {
        hasDefineProp = true
        const propName = walkCall(node, parent)
        s.overwriteNode(
          node,
          `${importHelperFn(
            s,
            offset,
            'toRef'
          )}(${PROPS_VARIABLE_NAME}, ${JSON.stringify(propName)})`,
          { offset }
        )
      } else if (isCallOf(node, DEFINE_PROPS)) {
        hasDefineProps = true
      }
    },
  })

  if (hasDefineProps && hasDefineProp)
    throw new Error(
      `${DEFINE_PROP} can not be used in the same file as ${DEFINE_PROPS}.`
    )

  const runtimeProps = await genRuntimeProps(isProduction)
  if (runtimeProps)
    s.prependLeft(
      offset!,
      `\nconst ${PROPS_VARIABLE_NAME} = defineProps(${runtimeProps});\n`
    )

  return getTransformResult(s, id)

  async function resolveTSType(type: TSType) {
    const resolved = await resolveTSReferencedType({
      scope: {
        kind: 'file',
        filePath: id,
        content: scriptSetup!.content,
        ast: setupAst.body,
      },
      type,
    })
    return resolved && inferRuntimeType(resolved)
  }
}
