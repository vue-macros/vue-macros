import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { getModelsType } from '../common'
import type { JsxAttributeNode, TransformOptions } from './index'

export function transformVModel({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  let firstNamespacedNode: (JsxAttributeNode & { name: string }) | undefined
  const result: Segment<FileRangeCapabilities>[] = []
  for (const { attribute, node } of nodes) {
    if (attribute.name.getText(sfc[source]?.ast).startsWith('v-model:')) {
      const name = attribute.name
        .getText(sfc[source]?.ast)
        .slice(8)
        .split(' ')[0]
        .split('_')[0]
      firstNamespacedNode ??= { attribute, node, name }
      if (firstNamespacedNode.attribute !== attribute) {
        replaceSourceRange(
          codes,
          source,
          attribute.getStart(sfc[source]?.ast),
          attribute.getEnd(),
          `onUpdate:${name}={() => {}}`,
        )
      }

      result.push(
        firstNamespacedNode.attribute !== attribute ? ',' : '',
        [
          name,
          source,
          attribute.name.getStart(sfc[source]?.ast) + 8,
          FileRangeCapabilities.full,
        ],
        attribute.initializer && name
          ? [
              `:${attribute.initializer
                .getText(sfc[source]?.ast)
                .slice(1, -1)}`,
              source,
              attribute.initializer.getStart(sfc[source]?.ast),
              FileRangeCapabilities.full,
            ]
          : '',
      )
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
  const { node, attribute, name } = firstNamespacedNode
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
    `onUpdate:${name}={() => {}} {...{`,
    ...result,
    `} satisfies __VLS_getModels<typeof ${tagName}>}`,
  )
}
