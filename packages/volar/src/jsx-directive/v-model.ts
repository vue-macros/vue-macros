/* eslint-disable vue/prefer-import-from-vue */

import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { camelize } from '@vue/shared'
import { getModelsType } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVModel({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxDirective[] }) {
  let firstNamespacedNode:
    | { attribute: JsxDirective['attribute']; tagName: string }
    | undefined
  const result: Segment<FileRangeCapabilities>[] = []
  for (const { attribute, node } of nodes) {
    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName.getText(sfc[source]?.ast)
      : ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(sfc[source]?.ast)
        : ''
    const modelValue = ['input', 'select', 'textarea'].includes(tagName)
      ? 'value'
      : 'modelValue'
    const isArrayExpression =
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    if (
      attribute.name.getText(sfc[source]?.ast).startsWith('v-model:') ||
      isArrayExpression
    ) {
      let isDynamic = false
      const attributeName = camelize(
        attribute.name
          .getText(sfc[source]?.ast)
          .slice(8)
          .split(' ')[0]
          .split('_')[0]
          .replace(/^\$(.*)\$/, (_, $1) => {
            isDynamic = true
            return $1
          }),
      )
      firstNamespacedNode ??= { attribute, tagName }
      if (firstNamespacedNode.attribute !== attribute) {
        replaceSourceRange(
          codes,
          source,
          attribute.getStart(sfc[source]?.ast),
          attribute.getEnd(),
        )
        result.push(',')
      }

      if (isArrayExpression) {
        const { elements } = attribute.initializer.expression
        if (elements[1] && !ts.isArrayLiteralExpression(elements[1])) {
          isDynamic = !ts.isStringLiteral(elements[1])
          result.push(
            isDynamic ? '[`${' : '',
            [
              elements[1].getText(sfc[source]?.ast),
              source,
              elements[1].getStart(sfc[source]?.ast),
              FileRangeCapabilities.full,
            ],
            isDynamic ? '}`]' : '',
          )
        } else {
          result.push(modelValue)
        }

        if (elements[0])
          result.push(':', [
            elements[0].getText(sfc[source]?.ast),
            source,
            elements[0].getStart(sfc[source]?.ast),
            FileRangeCapabilities.full,
          ])
      } else {
        result.push(
          isDynamic ? '[`${' : '',
          [
            attributeName,
            source,
            [
              attribute.name.getStart(sfc[source]?.ast) + 8,
              attribute.name.getEnd(),
            ],
            FileRangeCapabilities.full,
          ],
          isDynamic ? '}`]' : '',
        )

        if (attribute.initializer && attributeName)
          result.push(':', [
            attribute.initializer.getText(sfc[source]?.ast).slice(1, -1),
            source,
            attribute.initializer.getStart(sfc[source]?.ast) + 1,
            FileRangeCapabilities.full,
          ])
      }
    } else {
      replaceSourceRange(
        codes,
        source,
        attribute.name.getStart(sfc[source]?.ast),
        attribute.name.getEnd() + 1,
        [
          modelValue,
          source,
          [attribute.name.getStart(sfc[source]?.ast), attribute.name.getEnd()],
          FileRangeCapabilities.full,
        ],
        '=',
      )
    }
  }

  if (!firstNamespacedNode) return
  const { attribute, tagName } = firstNamespacedNode
  getModelsType(codes)

  replaceSourceRange(
    codes,
    source,
    attribute.getStart(sfc[source]?.ast),
    attribute.getEnd(),
    `{...{`,
    ...result,
    `} satisfies __VLS_getModels<typeof ${tagName}>}`,
  )
}
