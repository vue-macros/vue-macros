import { FileRangeCapabilities, replaceSourceRange } from '@vue/language-core'
import type { JsxDirective, TransformOptions } from './index'

export function transformVFor({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxDirective[] }) {
  nodes.forEach(({ attribute, node, parent }) => {
    if (
      !(
        attribute.initializer &&
        ts.isJsxExpression(attribute.initializer) &&
        attribute.initializer.expression &&
        ts.isBinaryExpression(attribute.initializer.expression)
      )
    )
      return

    let index
    let objectIndex
    let item = attribute.initializer.expression.left
    const list = attribute.initializer.expression.right
    if (
      ts.isParenthesizedExpression(item) &&
      ts.isBinaryExpression(item.expression)
    ) {
      if (ts.isBinaryExpression(item.expression.left)) {
        index = item.expression.left.right
        objectIndex = item.expression.right
        item = item.expression.left.left
      } else {
        index = item.expression.right
        item = item.expression.left
      }
    }
    if (!item || !list) return

    replaceSourceRange(
      codes,
      source,
      node.pos,
      node.pos,
      `${parent ? '{' : ' '}`,
      '__VLS_getVForSourceType(',
      [
        sfc[source]!.content.slice(list.pos + 1, list.end),
        source,
        list.pos + 1,
        FileRangeCapabilities.full,
      ],
      ').map(([',
      [
        `${sfc[source]?.content.slice(item.pos, item.end)}`,
        source,
        item.pos,
        FileRangeCapabilities.full,
      ],
      index
        ? [
            `, ${sfc[source]?.content.slice(index.pos + 1, index.end)}`,
            source,
            index.pos - 1,
            FileRangeCapabilities.full,
          ]
        : objectIndex
          ? ', undefined'
          : '',
      objectIndex
        ? [
            `, ${sfc[source]?.content.slice(
              objectIndex.pos + 1,
              objectIndex.end,
            )}`,
            source,
            objectIndex.pos - 1,
            FileRangeCapabilities.full,
          ]
        : '',
      ']) => ',
    )

    replaceSourceRange(
      codes,
      source,
      node.end - 1,
      node.end,
      `>)${parent ? '}' : ''}`,
    )
    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  })
}
