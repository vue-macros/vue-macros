import type { OptionsResolved } from '..'
import type { JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVIf(
  nodes: JsxDirective[],
  s: MagicStringAST,
  { prefix }: OptionsResolved,
): void {
  nodes.forEach(({ node, attribute, parent }, index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(
      String(parent?.type),
    )

    if (
      [`${prefix}if`, `${prefix}else-if`].includes(String(attribute.name.name))
    ) {
      if (attribute.value)
        s.appendLeft(
          node.start!,
          `${hasScope ? '' : '<>{'}${
            attribute.name.name === `${prefix}if` && hasScope ? '{' : ''
          }(${s.slice(
            attribute.value.start! + 1,
            attribute.value.end! - 1,
          )}) ? `,
        )

      s.appendRight(
        node.end!,
        String(nodes[index + 1]?.attribute.name.name).startsWith(
          `${prefix}else`,
        )
          ? ' :'
          : ` : null${hasScope ? '}' : '}</>'}`,
      )
    } else if (attribute.name.name === `${prefix}else`) {
      s.appendRight(node.end!, hasScope ? '}' : '')
    }

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      s.overwriteNode(node.openingElement.name, '')
      s.overwriteNode(node.closingElement.name, '')
    }

    s.remove(attribute.start! - 1, attribute.end!)
  })
}
