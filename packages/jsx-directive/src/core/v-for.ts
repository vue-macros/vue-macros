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
    parent?: Node | null
  }[] = []

  walkAST<Node>(ast, {
    enter(node, parent) {
      if (node.type !== 'JSXElement') return

      const attribute = node.openingElement.attributes.find(
        (i): i is JSXAttribute =>
          i.type === 'JSXAttribute' && ['v-for'].includes(`${i.name.name}`)
      )
      if (attribute) {
        nodes.push({
          node,
          attribute,
          parent,
        })
      }
    },
  })

  nodes.forEach(({ node, attribute, parent }) => {
    if (`${attribute.name.name}` === 'v-for' && attribute.value) {
      const [i, list] = s
        .slice(
          attribute.value.start! + offset + 1,
          attribute.value.end! + offset - 1
        )
        .split(/\s+in\s+/)

      const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)
      s.appendLeft(
        node.start! + offset,
        `${hasScope ? ' { ' : ''}${list}.map(${i}=> `
      )

      s.appendRight(node.end! + offset, `)${hasScope ? ' }' : ''}`)
      s.remove(attribute.start! + offset - 1, attribute.end! + offset)
    }
  })
}
