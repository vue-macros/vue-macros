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
  let firstNamespacedNode: JsxDirective | undefined
  const result: Segment<FileRangeCapabilities>[] = []
  for (const { attribute, node } of nodes) {
    const isArrayExpression =
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      ts.isArrayLiteralExpression(attribute.initializer.expression)

    if (
      attribute.name.getText(sfc[source]?.ast).startsWith('v-model:') ||
      isArrayExpression
    ) {
      const attributeName = camelize(
        attribute.name
          .getText(sfc[source]?.ast)
          .slice(8)
          .split(' ')[0]
          .split('_')[0],
      )
      firstNamespacedNode ??= { attribute, node }
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
          if (!ts.isStringLiteral(elements[1])) result.push('[`${')
          result.push([
            elements[1].getText(sfc[source]?.ast),
            source,
            elements[1].getStart(sfc[source]?.ast),
            FileRangeCapabilities.full,
          ])
          if (!ts.isStringLiteral(elements[1])) result.push('}`]')
        } else {
          result.push('modelValue')
        }

        if (elements[0])
          result.push([
            `:${elements[0].getText(sfc[source]?.ast)}`,
            source,
            elements[0].getStart(sfc[source]?.ast),
            FileRangeCapabilities.full,
          ])
      } else {
        result.push([
          attributeName,
          source,
          [attribute.name.getStart(sfc[source]?.ast) + 8, attribute.name.end],
          FileRangeCapabilities.full,
        ])

        if (attribute.initializer && attributeName)
          result.push([
            `:${attribute.initializer.getText(sfc[source]?.ast).slice(1, -1)}`,
            source,
            attribute.initializer.getStart(sfc[source]?.ast),
            FileRangeCapabilities.full,
          ])
      }
    } else {
      replaceSourceRange(
        codes,
        source,
        attribute.name.getStart(sfc[source]?.ast),
        attribute.name.getEnd() + 1,
        `onUpdate:modelValue={() => {}} `,
        [
          'modelValue',
          source,
          [attribute.name.getStart(sfc[source]?.ast), attribute.name.getEnd()],
          FileRangeCapabilities.full,
        ],
        '=',
      )
    }
  }

  if (!firstNamespacedNode) return
  const { node, attribute } = firstNamespacedNode
  getModelsType(codes)

  const tagName = ts.isJsxSelfClosingElement(node)
    ? node.tagName.getText(sfc[source]?.ast)
    : ts.isJsxElement(node)
      ? node.openingElement.tagName.getText(sfc[source]?.ast)
      : null
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
