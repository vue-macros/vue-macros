import {
  DEFINE_RENDER,
  MagicString,
  getLang,
  getTransformResult,
  swc,
} from '@vue-macros/common'
import { walk } from 'estree-walker'
import { is } from '@swc/core'
import type { BlockStatement, ExpressionStatement, Node } from '@swc/core'

// TODO: replace Babel with SWC

export const transfromDefineRender = (code: string, id: string) => {
  if (!code.includes(DEFINE_RENDER)) return

  const lang = getLang(id)
  const program = swc.parse(code, lang === 'vue' ? 'js' : lang)

  const nodes: {
    parent: BlockStatement
    node: ExpressionStatement
    arg: Node
  }[] = []
  walk(program, {
    enter(node: Node, parent: Node) {
      if (
        node.type !== 'ExpressionStatement' ||
        !swc.isCallOf(
          (node as ExpressionStatement).expression,
          DEFINE_RENDER
        ) ||
        parent.type !== 'BlockStatement'
      )
        return

      nodes.push({
        parent,
        node,
        arg: node.expression.arguments[0],
      })
    },
  })
  // if (nodes.length === 0) return

  // const s = new MagicString(code)

  // for (const { parent, node, arg } of nodes) {
  //   // check parent
  //   const returnStmt = parent.body.find(
  //     (node) => node.type === 'ReturnStatement'
  //   )
  //   if (returnStmt) s.removeNode(returnStmt)

  //   const index = returnStmt ? returnStmt.start! : parent.end! - 1
  //   const shouldAddFn = !isFunction(arg) && arg.type !== 'Identifier'
  //   s.appendLeft(index, `return ${shouldAddFn ? '() => (' : ''}`)
  //   s.moveNode(arg, index)
  //   if (shouldAddFn) s.appendRight(index, `)`)

  //   // removes `defineRender(`
  //   s.remove(node.start!, arg.start!)
  //   // removes `)`
  //   s.remove(arg.end!, node.end!)
  // }

  // return getTransformResult(s, id)
}
