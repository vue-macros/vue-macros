import { HELPER_PREFIX, type MagicString } from '@vue-macros/common'
import { type JsxDirectiveNode } from '.'

export function transformVFor(
  nodes: JsxDirectiveNode[],
  s: MagicString,
  offset = 0
) {
  nodes.forEach(({ node, attribute, parent, vMemoAttribute }) => {
    if (!attribute.value) return

    let item, index, list
    if (
      attribute.value.type === 'JSXExpressionContainer' &&
      attribute.value.expression.type === 'BinaryExpression'
    ) {
      if (attribute.value.expression.left.type === 'SequenceExpression') {
        const expressions = attribute.value.expression.left.expressions
        item = expressions[0].type === 'Identifier' ? expressions[0].name : ''
        index = expressions[1].type === 'Identifier' ? expressions[1].name : ''
      } else if (attribute.value.expression.left.type === 'Identifier') {
        item = attribute.value.expression.left.name
      }

      if (vMemoAttribute) index ??= `${HELPER_PREFIX}index`

      if (attribute.value.expression.right)
        list = s.sliceNode(attribute.value.expression.right, { offset })
    }
    if (!item || !list) return

    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)
    s.appendLeft(
      node.start! + offset,
      `${hasScope ? '{' : ''}Array.from(${list}).map((${item}${
        index ? `, ${index}` : ''
      }) => `
    )

    s.prependRight(node.end! + offset, `)${hasScope ? '}' : ''}`)
    s.remove(attribute.start! + offset - 1, attribute.end! + offset)
  })
}
