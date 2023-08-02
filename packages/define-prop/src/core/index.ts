import {
  DEFINE_PROP,
  DEFINE_PROPS,
  HELPER_PREFIX,
  MagicString,
  generateTransform,
  importHelperFn,
  isCallOf,
  parseSFC,
  walkASTSetup,
} from '@vue-macros/common'
import { inferRuntimeType, resolveTSReferencedType } from '@vue-macros/api'
import { kevinEdition } from './kevin-edition'
import { johnsonEdition } from './johnson-edition'
import { helperId } from './helper'
import type * as t from '@babel/types'

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

  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return

  const setupAst = sfc.getSetupAst()!

  const offset = sfc.scriptSetup.loc.start.offset
  const s = new MagicString(code)

  const { walkCall, genRuntimeProps } = (
    edition === 'kevinEdition' ? kevinEdition : johnsonEdition
  )({ s, offset, resolveTSType })

  let definePropsCall: t.CallExpression | undefined
  await walkASTSetup(setupAst, (setup) => {
    setup.onEnter(
      (node): node is t.CallExpression => isCallOf(node, DEFINE_PROP),
      (node, parent) => {
        const propName = walkCall(node, parent)
        s.overwriteNode(
          node,
          `${importHelperFn(s, offset, 'toRef')}(__props, ${JSON.stringify(
            propName
          )})`,
          { offset }
        )
      }
    )
    setup.onEnter(
      (node): node is t.CallExpression => isCallOf(node, DEFINE_PROPS),
      (node) => {
        definePropsCall = node
      }
    )
  })

  const runtimeProps = await genRuntimeProps(isProduction)
  if (!runtimeProps) return

  if (definePropsCall?.typeParameters) {
    throw new SyntaxError(
      `defineProp cannot be used with defineProps<T>() in the same component.`
    )
  }

  if (definePropsCall && definePropsCall.arguments.length > 0) {
    const originalProps = s.sliceNode(definePropsCall.arguments[0], { offset })
    const normalizePropsOrEmits = importHelperFn(
      s,
      offset,
      'normalizePropsOrEmits',
      helperId,
      true
    )
    s.overwriteNode(
      definePropsCall.arguments[0],
      `{ ...${normalizePropsOrEmits}(${originalProps}), ...${normalizePropsOrEmits}(${runtimeProps}) }`,
      {
        offset,
      }
    )
  } else {
    s.prependLeft(
      offset,
      `\nconst ${PROPS_VARIABLE_NAME} = defineProps(${runtimeProps});\n`
    )
  }

  return generateTransform(s, id)

  async function resolveTSType(type: t.TSType) {
    const resolved = await resolveTSReferencedType({
      scope: {
        kind: 'file',
        filePath: id,
        content: sfc.scriptSetup!.content,
        ast: setupAst.body,
      },
      type,
    })
    return resolved && inferRuntimeType(resolved)
  }
}
