import { type Code, replaceSourceRange } from '@vue/language-core'
import { enableAllFeatures } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  { ts, sfc, source }: TransformOptions,
) {
  const result: Code[] = []
  if (
    attribute.initializer &&
    ts.isJsxExpression(attribute.initializer) &&
    attribute.initializer.expression &&
    ts.isBinaryExpression(attribute.initializer.expression)
  ) {
    let index
    let objectIndex
    let item = attribute.initializer.expression.left
    const list = attribute.initializer.expression.right
    if (ts.isParenthesizedExpression(item)) {
      if (ts.isBinaryExpression(item.expression)) {
        if (ts.isBinaryExpression(item.expression.left)) {
          index = item.expression.left.right
          objectIndex = item.expression.right
          item = item.expression.left.left
        } else {
          index = item.expression.right
          item = item.expression.left
        }
      } else {
        item = item.expression
      }
    }

    if (item && list) {
      result.push(
        '__VLS_getVForSourceType(',
        [
          sfc[source]!.content.slice(list.getStart(sfc[source]?.ast), list.end),
          source,
          list.getStart(sfc[source]?.ast),
          enableAllFeatures(),
        ],
        ').map(([',
        [
          `${sfc[source]?.content.slice(item.getStart(sfc[source]?.ast), item.end)}`,
          source,
          item.getStart(sfc[source]?.ast),
          enableAllFeatures(),
        ],
        ', ',
        index
          ? [
              `${sfc[source]?.content.slice(index.getStart(sfc[source]?.ast), index.end)}`,
              source,
              index.getStart(sfc[source]?.ast),
              enableAllFeatures(),
            ]
          : objectIndex
            ? 'undefined'
            : '',
        ...(objectIndex
          ? [
              ', ',
              [
                `${sfc[source]?.content.slice(objectIndex.getStart(sfc[source]?.ast), objectIndex.end)}`,
                source,
                objectIndex.getStart(sfc[source]?.ast),
                enableAllFeatures(),
              ] as Code,
            ]
          : ''),
        ']) => ',
      )
    }
  }

  return result
}

export function transformVFor(
  nodes: JsxDirective[],
  options: TransformOptions,
) {
  const { codes, source } = options

  nodes.forEach(({ attribute, node, parent }) => {
    const result = resolveVFor(attribute, options)
    if (parent) {
      result.unshift('{')
    }

    replaceSourceRange(codes, source, node.pos, node.pos, ...result)

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
