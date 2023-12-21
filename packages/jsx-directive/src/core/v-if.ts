import type { MagicString } from '@vue-macros/common'
import type { JsxDirective } from '.'

export function transformVIf(
  nodes: JsxDirective[],
  s: MagicString,
  offset: number,
  version: number,
) {
  nodes.forEach(({ node, attribute, parent }, index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)

    if (['v-if', 'v-else-if'].includes(`${attribute.name.name}`)) {
      if (attribute.value)
        s.appendLeft(
          node.start! + offset,
          `${attribute.name.name === 'v-if' && hasScope ? '{' : ' '}(${s.slice(
            attribute.value.start! + offset + 1,
            attribute.value.end! + offset - 1,
          )}) ? `,
        )

      s.appendRight(
        node.end! + offset,
        `${nodes[index + 1]?.attribute.name.name}`.startsWith('v-else')
          ? ' :'
          : ` : null${hasScope ? '}' : ''}`,
      )
    } else if (attribute.name.name === 'v-else') {
      s.appendRight(node.end! + offset, hasScope ? '}' : '')
    }

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      const content = version < 3 ? 'span' : ''
      s.overwriteNode(node.openingElement.name, content, { offset })
      s.overwriteNode(node.closingElement.name, content, { offset })
    }

    s.remove(attribute.start! + offset - 1, attribute.end! + offset)
  })
}
