import {
  HELPER_PREFIX,
  type MagicStringAST,
  importHelperFn,
} from '@vue-macros/common'
import type { JsxDirective } from '.'

export function transformVMemo(
  nodes: JsxDirective[],
  s: MagicStringAST,
  offset: number,
): void {
  if (nodes.length === 0) return
  const withMemo = importHelperFn(s, offset, 'withMemo', 'vue')
  s.prependRight(offset, `const ${HELPER_PREFIX}cache = [];`)

  nodes.forEach(({ node, attribute, parent, vForAttribute }, nodeIndex) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)

    s.appendLeft(
      node.start! + offset,
      `${hasScope ? '{' : ''}${withMemo}(${
        attribute.value
          ? s.slice(
              attribute.value.start! + offset + 1,
              attribute.value.end! + offset - 1,
            )
          : `[]`
      }, () => `,
    )

    let index = `${nodeIndex}`
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
      s.appendRight(offset, `${cache} = [];`)
      index += ` + ${vForIndex} + 1`
    }

    s.prependRight(
      node.end! + offset,
      `, ${cache}, ${index})${hasScope ? '}' : ''}`,
    )

    s.remove(attribute.start! + offset - 1, attribute.end! + offset)
  })
}
