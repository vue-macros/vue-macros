import {
  DEFINE_PROPS,
  MagicString,
  WITH_DEFAULTS,
  generateTransform,
  isCallOf,
  isIdentifierOf,
  parseSFC,
  removeMacroImport,
  walkAST,
} from '@vue-macros/common'
import {
  type CallExpression,
  type MemberExpression,
  type Node,
} from '@babel/types'

export function transformChainCall(code: string, id: string) {
  if (!code.includes(DEFINE_PROPS)) return

  const { scriptSetup, getSetupAst, offset } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  walkAST<Node>(setupAst, {
    enter(node) {
      if (removeMacroImport(node, s, offset)) return
      if (isChainCall(node)) processChainCall(node)
    },
  })

  function processChainCall(node: CallExpression) {
    const withDefaultString: string | undefined =
      node.arguments[0] && s.sliceNode(node.arguments[0], { offset })
    const definePropsString = s.sliceNode(
      (node.callee as MemberExpression).object as CallExpression,
      { offset }
    )

    s.overwriteNode(
      node,
      withDefaultString
        ? `${WITH_DEFAULTS}(${definePropsString}, ${withDefaultString})`
        : definePropsString,
      { offset }
    )
  }

  return generateTransform(s, id)
}

function isChainCall(node: Node): node is CallExpression {
  // defineProps().withDefaults()
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    isCallOf(node.callee.object, DEFINE_PROPS) &&
    isIdentifierOf(node.callee.property, WITH_DEFAULTS)
  )
}
