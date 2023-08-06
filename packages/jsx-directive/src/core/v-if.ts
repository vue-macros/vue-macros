import { type MagicString } from '@vue-macros/common'
import { type JsxDirectiveNode } from '.'

export function transformVIf(
  nodes: JsxDirectiveNode[],
  s: MagicString,
  offset = 0
) {
  nodes.forEach(({ node, attribute, parent }, index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)

    if (['v-if', 'v-else-if'].includes(`${attribute.name.name}`)) {
      if (attribute.value)
        s.appendLeft(
          node.start! + offset,
          `${attribute.name.name === 'v-if' && hasScope ? '{' : ''}${s.slice(
            attribute.value.start! + offset + 1,
            attribute.value.end! + offset - 1
          )} ? `
        )

      s.appendRight(
        node.end! + offset,
        `${nodes[index + 1]?.attribute.name.name}`.startsWith('v-else')
          ? ' :'
          : ` : null${hasScope ? '}' : ''}`
      )
    } else if (attribute.name.name === 'v-else') {
      s.appendRight(node.end! + offset, hasScope ? '}' : '')
    }

    s.remove(attribute.start! + offset - 1, attribute.end! + offset)
  })
}
