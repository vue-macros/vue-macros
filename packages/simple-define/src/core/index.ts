import {
  DEFINE_PROPS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import { type NodeTransform } from '@vue/compiler-core'
import { type CallExpression, type Node } from '@babel/types'

const SIMPLE_PROPS = 'simpleProps'

export function transformSimpleDefine(code: string, id: string) {
  if (!code.includes(SIMPLE_PROPS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicString(code)
  const offset = scriptSetup.loc.start.offset
  const setupAst = getSetupAst()!

  walkAST<Node>(setupAst, {
    enter(node) {
      if (isCallOf(node, SIMPLE_PROPS)) {
        processSimpleProps(node)
      }
    },
  })

  return getTransformResult(s, id)

  function processSimpleProps(node: CallExpression) {
    if (!node.typeParameters)
      throw new SyntaxError(`${SIMPLE_PROPS} must have a type parameter.`)

    s.removeNode(node.typeParameters, { offset })
    s.overwriteNode(node.callee, DEFINE_PROPS, { offset })
  }
}

export function transformSimpleDefineTemplate(): NodeTransform {
  return (node) => {
    if (node.type !== 1) return
    for (const [i, prop] of node.props.entries()) {
      if (prop.type !== 6 || prop.value !== undefined) continue
      node.props[i] = {
        type: 7 /* NodeTypes.DIRECTIVE */,
        name: 'bind',
        arg: {
          type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
          constType: 3 /* ConstantTypes.CAN_STRINGIFY */,
          content: 'checked',
          isStatic: true,
          loc: prop.loc,
        },
        exp: {
          type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
          constType: 3 /* ConstantTypes.CAN_STRINGIFY */,
          content: 'true',
          isStatic: false,
          loc: prop.loc,
        },
        loc: prop.loc,
        modifiers: [],
      }
    }
  }
}
