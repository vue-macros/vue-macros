import {
  type JSXAttribute,
  type JSXElement,
  type Node,
  type Program,
} from '@babel/types'
import { type MagicString, walkAST } from '@vue-macros/common'

export function vIfTransform(ast: Program, s: MagicString, offset = 0) {
  if (!s.sliceNode(ast, { offset }).includes('v-if')) return

  const nodeMap = new Map<
    Node,
    {
      node: JSXElement
      attribute: JSXAttribute
      parent?: Node | null
    }[]
  >()

  walkAST<Node>(ast, {
    enter(node, parent) {
      if (node.type !== 'JSXElement') return

      const attribute = node.openingElement.attributes.find(
        (i) =>
          i.type === 'JSXAttribute' &&
          ['v-if', 'v-else-if', 'v-else'].includes(`${i.name.name}`)
      ) as JSXAttribute
      if (attribute) {
        if (!nodeMap.has(parent!)) nodeMap.set(parent!, [])

        nodeMap.get(parent!)?.push({
          node,
          attribute,
          parent,
        })
      }
    },
  })

  const nodes = [...nodeMap.values()].flat()
  nodes.forEach(({ node, attribute, parent }, index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)

    if (['v-if', 'v-else-if'].includes(`${attribute.name.name}`)) {
      if (attribute.value)
        s.appendLeft(
          node.start! + offset,
          `${attribute.name.name === 'v-if' && hasScope ? '{ ' : ''}${s.slice(
            attribute.value.start! + offset + 1,
            attribute.value.end! + offset - 1
          )} ? `
        )

      s.appendRight(
        node.end! + offset,
        `${nodes[index + 1]?.attribute.name.name}`.startsWith('v-else')
          ? ' :'
          : ` : ''${hasScope ? ' }' : ''}`
      )
      s.remove(attribute.start! + offset - 1, attribute.end! + offset)
    } else if (attribute.name.name === 'v-else') {
      s.appendRight(node.end! + offset, hasScope ? ' }' : '')
    }
  })
}
