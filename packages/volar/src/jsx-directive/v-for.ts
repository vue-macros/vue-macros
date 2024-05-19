import {
  type Code,
  allCodeFeatures,
  replaceSourceRange,
} from '@vue/language-core'
import { getStart, isJsxExpression } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  options: TransformOptions,
) {
  const { ts, sfc, source } = options
  const result: Code[] = []

  if (
    isJsxExpression(attribute.initializer) &&
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
          sfc[source]!.content.slice(getStart(list, options), list.end),
          source,
          getStart(list, options),
          allCodeFeatures,
        ],
        ').map(([',
        [
          `${sfc[source]?.content.slice(getStart(item, options), item.end)}`,
          source,
          getStart(item, options),
          allCodeFeatures,
        ],
        ', ',
        index
          ? [
              `${sfc[source]?.content.slice(getStart(index, options), index.end)}`,
              source,
              getStart(index, options),
              allCodeFeatures,
            ]
          : objectIndex
            ? 'undefined'
            : '',
        ...(objectIndex
          ? [
              ', ',
              [
                `${sfc[source]?.content.slice(getStart(objectIndex, options), objectIndex.end)}`,
                source,
                getStart(objectIndex, options),
                allCodeFeatures,
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
