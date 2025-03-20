import { inferRuntimeType, resolveTSReferencedType } from '@vue-macros/api'
import {
  DEFINE_PROP,
  DEFINE_PROP_DOLLAR,
  DEFINE_PROPS,
  generateTransform,
  HELPER_PREFIX,
  importHelperFn,
  isCallOf,
  MagicStringAST,
  parseSFC,
  walkAST,
  type CodeTransform,
} from '@vue-macros/common'
import { helperId } from './helper'
import { johnsonEdition } from './johnson-edition'
import { kevinEdition } from './kevin-edition'
import type * as t from '@babel/types'

export * from './utils'
export * from './kevin-edition'
export * from './johnson-edition'

export const PROPS_VARIABLE_NAME: '__MACROS_props' = `${HELPER_PREFIX}props`
export type Edition = 'kevinEdition' | 'johnsonEdition'

export async function transformDefineProp(
  code: string,
  id: string,
  edition: Edition = 'kevinEdition',
  isProduction = false,
): Promise<CodeTransform | undefined> {
  if (!code.includes(DEFINE_PROP)) return

  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return

  const setupAst = sfc.getSetupAst()!

  const offset = sfc.scriptSetup.loc.start.offset
  const s = new MagicStringAST(code)

  const { walkCall, genRuntimeProps } = (
    edition === 'kevinEdition' ? kevinEdition : johnsonEdition
  )({ s, offset, resolveTSType })

  let definePropsCall: t.CallExpression | undefined
  const parentMap = new WeakMap<t.Node, t.Node | undefined | null>()
  walkAST<t.Node>(setupAst, {
    enter: (node, parent) => {
      if (isCallOf(node, DEFINE_PROPS)) {
        definePropsCall = node
      }

      parentMap.set(node, parent)

      if (!isCallOf(node, [DEFINE_PROP, DEFINE_PROP_DOLLAR])) return

      const isCallOfDollar =
        isCallOf(parent, '$') && isCallOf(node, DEFINE_PROP)

      const isReactiveTransform =
        isCallOfDollar || isCallOf(node, DEFINE_PROP_DOLLAR)

      const propName = walkCall(
        node,
        isCallOfDollar ? parentMap.get(parent) : parent,
      )
      s.overwriteNode(
        isCallOfDollar ? parent : node,
        `${isReactiveTransform ? '$(' : ''}${importHelperFn(
          s,
          offset,
          'toRef',
        )}(__props, ${JSON.stringify(propName)})${
          isReactiveTransform ? ')' : ''
        }`,
        { offset },
      )
    },
  })

  const runtimeProps = await genRuntimeProps(isProduction)
  if (!runtimeProps) return

  if (definePropsCall?.typeParameters) {
    throw new SyntaxError(
      `defineProp cannot be used with defineProps<T>() in the same component.`,
    )
  }

  if (definePropsCall && definePropsCall.arguments.length > 0) {
    const originalProps = s.sliceNode(definePropsCall.arguments[0], { offset })
    const normalizePropsOrEmits = importHelperFn(
      s,
      offset,
      'default',
      'normalizePropsOrEmits',
      helperId,
    )
    s.overwriteNode(
      definePropsCall.arguments[0],
      `{ ...${normalizePropsOrEmits}(${originalProps}), ...${normalizePropsOrEmits}(${runtimeProps}) }`,
      {
        offset,
      },
    )
  } else {
    s.prependLeft(
      offset,
      `\nconst ${PROPS_VARIABLE_NAME} = defineProps(${runtimeProps});\n`,
    )
  }

  return generateTransform(s, id)

  function resolveTSType(type: t.TSType): Promise<string[] | undefined> {
    return resolveTSReferencedType({
      scope: {
        kind: 'file',
        filePath: id,
        content: sfc.scriptSetup!.content,
        ast: setupAst.body,
      },
      type,
    })
      .map(
        (resolved) =>
          resolved && inferRuntimeType(resolved).unwrapOr(undefined),
      )
      .unwrapOr(undefined)
  }
}
