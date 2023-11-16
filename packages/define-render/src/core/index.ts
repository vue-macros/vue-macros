import {
  DEFINE_RENDER,
  MagicString,
  babelParse,
  generateTransform,
  getLang,
  isCallOf,
  isFunctionType,
  walkAST,
} from '@vue-macros/common'
import type * as t from '@babel/types'

export function transformDefineRender(code: string, id: string) {
  if (!code.includes(DEFINE_RENDER)) return

  const lang = getLang(id)
  const program = babelParse(code, lang === 'vue' ? 'js' : lang)

  const nodes: {
    parent: t.BlockStatement
    node: t.ExpressionStatement
    arg: t.Node
  }[] = []
  walkAST<t.Node>(program, {
    enter(node, parent) {
      if (
        node.type !== 'ExpressionStatement' ||
        !isCallOf(node.expression, DEFINE_RENDER) ||
        parent?.type !== 'BlockStatement'
      )
        return

      nodes.push({
        parent,
        node,
        arg: node.expression.arguments[0],
      })
    },
  })
  if (nodes.length === 0) return

  const s = new MagicString(code)

  for (const { parent, node, arg } of nodes) {
    // check parent
    const returnStmt = parent.body.find(
      (node) => node.type === 'ReturnStatement'
    )
    if (returnStmt) s.removeNode(returnStmt)

    const index = returnStmt ? returnStmt.start! : parent.end! - 1
    const shouldAddFn = !isFunctionType(arg) && arg.type !== 'Identifier'
    s.appendLeft(index, `return ${shouldAddFn ? '() => (' : ''}`)
    s.moveNode(arg, index)
    if (shouldAddFn) s.appendRight(index, `)`)

    // removes `defineRender(`
    s.remove(node.start!, arg.start!)
    // removes `)`
    s.remove(arg.end!, node.end!)
  }

  return generateTransform(s, id)
}
