import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'
import type { JsxDirective } from '.'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  s: MagicStringAST,
  { lib }: OptionsResolved,
  vMemoAttribute?: JsxDirective['attribute'],
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

      const params = `(${item}${
        index ? `, ${index}` : ''
      }${objectIndex ? `, ${objectIndex}` : ''})`
      const renderList = importHelperFn(
        s,
        0,
        'renderList',
        undefined,
        lib.startsWith('vue') ? 'vue' : '@vue-macros/jsx-directive/helpers',
      )
      return `${renderList}(${list}, ${params} => `
    }
  }

  return ''
}

export function transformVFor(
  nodes: JsxDirective[],
  s: MagicStringAST,
  options: OptionsResolved,
): void {
  if (nodes.length === 0) return

  nodes.forEach(({ node, attribute, parent, vIfAttribute, vMemoAttribute }) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(
      String(parent?.type),
    )
    s.prependRight(
      node.end!,
      `)${hasScope ? (vIfAttribute ? '' : '}') : '}</>'}`,
    )
    s.appendLeft(
      node.start!,
      `${hasScope ? (vIfAttribute ? '' : '{') : '<>{'}${resolveVFor(attribute, s, options, vMemoAttribute)}`,
    )
    s.remove(attribute.start! - 1, attribute.end!)

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
