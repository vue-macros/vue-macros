import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import type { OptionsResolved } from './plugin'
import type { JsxDirective } from '.'

export function transformVMemo(
  nodes: JsxDirective[],
  s: MagicStringAST,
  { lib }: OptionsResolved,
): void {
  if (nodes.length === 0) return
  const withMemo = importHelperFn(
    s,
    0,
    'withMemo',
    lib.startsWith('vue') ? 'vue' : '@vue-macros/jsx-directive/helpers',
  )
  s.prependRight(0, `const ${HELPER_PREFIX}cache = [];`)

  nodes.forEach(({ node, attribute, parent, vForAttribute }, nodeIndex) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(
      String(parent?.type),
    )

    s.appendLeft(
      node.start!,
      `${hasScope ? '{' : ''}${withMemo}(${
        attribute.value
          ? s.slice(attribute.value.start! + 1, attribute.value.end! - 1)
          : `[]`
      }, () => `,
    )

    let index = String(nodeIndex)
    let cache = `${HELPER_PREFIX}cache`
    let vForIndex = `${HELPER_PREFIX}index`
    if (vForAttribute?.value?.type === 'JSXExpressionContainer') {
      if (
        vForAttribute.value.expression.type === 'BinaryExpression' &&
        vForAttribute.value.expression.left.type === 'SequenceExpression' &&
        vForAttribute.value.expression.left.expressions[1].type === 'Identifier'
      )
        vForIndex = vForAttribute.value.expression.left.expressions[1].name

      cache += `[${index}]`
      s.appendRight(0, `${cache} = [];`)
      index += ` + ${vForIndex} + 1`
    }

    s.prependRight(node.end!, `, ${cache}, ${index})${hasScope ? '}' : ''}`)

    s.remove(attribute.start! - 1, attribute.end!)
  })
}
