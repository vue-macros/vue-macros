import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import { isVue2, type JsxDirective } from '.'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  {
    s,
    version,
    vMemoAttribute,
  }: {
    s: MagicStringAST
    version: number
    vMemoAttribute?: JsxDirective['attribute']
  },
): string {
  if (attribute.value) {
    let item, index, objectIndex, list
    if (
      attribute.value.type === 'JSXExpressionContainer' &&
      attribute.value.expression.type === 'BinaryExpression'
    ) {
      if (attribute.value.expression.left.type === 'SequenceExpression') {
        const expressions = attribute.value.expression.left.expressions
        item = expressions[0] ? s.sliceNode(expressions[0]) : ''
        index = expressions[1] ? s.sliceNode(expressions[1]) : ''
        objectIndex = expressions[2] ? s.sliceNode(expressions[2]) : ''
      } else {
        item = s.sliceNode(attribute.value.expression.left)
      }

      list = s.sliceNode(attribute.value.expression.right)
    }

    if (item && list) {
      if (vMemoAttribute) {
        index ??= `${HELPER_PREFIX}index`
      }

      const renderList = isVue2(version)
        ? 'Array.from'
        : importHelperFn(
            s,
            0,
            'renderList',
            version ? 'vue' : '@vue-macros/jsx-directive/helpers',
          )

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
  version: number,
): void {
  if (nodes.length === 0) return

  nodes.forEach(({ node, attribute, parent, vMemoAttribute }) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)
    s.appendLeft(
      node.start!,
      `${hasScope ? '{' : ''}${resolveVFor(attribute, { s, version, vMemoAttribute })}`,
    )

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      const content = isVue2(version) ? 'span' : ''
      s.overwriteNode(node.openingElement.name, content)
      s.overwriteNode(node.closingElement.name, content)
    }

    s.prependRight(node.end!, `)${hasScope ? '}' : ''}`)
    s.remove(attribute.start! - 1, attribute.end!)
  })
}
