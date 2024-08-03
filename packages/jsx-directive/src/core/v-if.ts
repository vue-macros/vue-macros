import { isVue2, type JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVIf(
  nodes: JsxDirective[],
  s: MagicStringAST,
  version: number,
): void {
  nodes.forEach(({ node, attribute, parent }, index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)

    if (['v-if', 'v-else-if'].includes(`${attribute.name.name}`)) {
      if (attribute.value)
        s.appendLeft(
          node.start!,
          `${attribute.name.name === 'v-if' && hasScope ? '{' : ' '}(${s.slice(
            attribute.value.start! + 1,
            attribute.value.end! - 1,
          )}) ? `,
        )

      s.appendRight(
        node.end!,
        `${nodes[index + 1]?.attribute.name.name}`.startsWith('v-else')
          ? ' :'
          : ` : null${hasScope ? '}' : ''}`,
      )
    } else if (attribute.name.name === 'v-else') {
      s.appendRight(node.end!, hasScope ? '}' : '')
    }

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      const content = isVue2(version) ? 'span' : ''
      s.overwriteNode(node.openingElement.name, content)
      s.overwriteNode(node.closingElement.name, content)
    }

    s.remove(attribute.start! - 1, attribute.end!)
  })
}
