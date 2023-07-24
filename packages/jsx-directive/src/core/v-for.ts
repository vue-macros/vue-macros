import {
  type JSXAttribute,
  type JSXElement,
  type Node,
  type Program,
} from '@babel/types'
import { type MagicString, walkAST } from '@vue-macros/common'

export function vForTransform(ast: Program, s: MagicString, offset = 0) {
  if (!s.sliceNode(ast, { offset }).includes('v-for')) return

  const nodes: {
    node: JSXElement
    attribute: JSXAttribute
  }[] = []

  walkAST<Node>(ast, {
    enter(node) {
      if (node.type !== 'JSXElement') return

      const attribute = node.openingElement.attributes.find(
        (i): i is JSXAttribute =>
          i.type === 'JSXAttribute' && ['v-for'].includes(`${i.name.name}`)
      )
      if (attribute) {
        nodes.push({
          node,
          attribute,
        })
      }
    },
  })

  nodes.forEach(({ node, attribute }) => {
    if (`${attribute.name.name}` === 'v-for') {
      if (!attribute.value) return
      const [i, list] = s
        .slice(
          attribute.value.start! + offset + 1,
          attribute.value.end! + offset - 1
        )
        .split(/\s+in\s+/)

      s.appendLeft(node.start! + offset, ` { ${list}.map(${i}=> `)

      s.appendRight(node.end! + offset, ') }')
      s.remove(attribute.start! + offset - 1, attribute.end! + offset)
    }
  })
}
