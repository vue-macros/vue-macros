import {
  HELPER_PREFIX,
  type MagicStringAST,
  importHelperFn,
} from '@vue-macros/common'
import type { JsxDirective } from '.'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  {
    s,
    offset,
    version,
    vMemoAttribute,
  }: {
    s: MagicStringAST
    offset: number
    version: number
    vMemoAttribute?: JsxDirective['attribute']
  },
) {
  if (attribute.value) {
    let item, index, objectIndex, list
    if (
      attribute.value.type === 'JSXExpressionContainer' &&
      attribute.value.expression.type === 'BinaryExpression'
    ) {
      if (attribute.value.expression.left.type === 'SequenceExpression') {
        const expressions = attribute.value.expression.left.expressions
        item = expressions[0] ? s.sliceNode(expressions[0], { offset }) : ''
        index = expressions[1] ? s.sliceNode(expressions[1], { offset }) : ''
        objectIndex = expressions[2]
          ? s.sliceNode(expressions[2], { offset })
          : ''
      } else {
        item = s.sliceNode(attribute.value.expression.left, { offset })
      }

      list = s.sliceNode(attribute.value.expression.right, { offset })
    }

    if (item && list) {
      if (vMemoAttribute) {
        index ??= `${HELPER_PREFIX}index`
      }

      const renderList =
        version < 3
          ? 'Array.from'
          : importHelperFn(s, offset, 'renderList', 'vue')

      return `${renderList}(${list}, (${item}${
        index ? `, ${index}` : ''
      }${objectIndex ? `, ${objectIndex}` : ''}) => `
    }
  }

  return ''
}

export function transformVFor(
  nodes: JsxDirective[],
  s: MagicStringAST,
  offset: number,
  version: number,
) {
  if (nodes.length === 0) return

  nodes.forEach(({ node, attribute, parent, vMemoAttribute }) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)
    s.appendLeft(
      node.start! + offset,
      `${hasScope ? '{' : ''}${resolveVFor(attribute, { s, offset, version, vMemoAttribute })}`,
    )

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      const content = version < 3 ? 'span' : ''
      s.overwriteNode(node.openingElement.name, content, { offset })
      s.overwriteNode(node.closingElement.name, content, { offset })
    }

    s.prependRight(node.end! + offset, `)${hasScope ? '}' : ''}`)
    s.remove(attribute.start! + offset - 1, attribute.end! + offset)
  })
}
