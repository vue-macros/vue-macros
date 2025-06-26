import type { OptionsResolved } from '..'
import type { JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVIf(
  nodes: JsxDirective[],
  s: MagicStringAST,
  options: OptionsResolved,
): void {
  const { prefix } = options
  nodes.forEach(({ node, attribute, parent }, index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(
      String(parent?.type),
    )

    if (
      [`${prefix}if`, `${prefix}else-if`].includes(
        String(attribute.name.name),
      ) &&
      attribute.value?.type === 'JSXExpressionContainer'
    ) {
      s.replaceRange(
        node.start!,
        node.start!,
        hasScope ? '' : '<>{',
        attribute.name.name === `${prefix}if` && hasScope ? '{' : '',
        '(',
        attribute.value.expression,
        ') ? ',
      )

      s.replaceRange(
        node.end!,
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

    s.replaceRange(attribute.start! - 1, attribute.end!)

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      s.overwriteNode(node.openingElement.name, '')
      s.overwriteNode(node.closingElement.name, '')
    }
  })
}
