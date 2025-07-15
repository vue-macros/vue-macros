import { getStart, isJsxExpression } from '../common'
import type { JsxDirective, TransformOptions } from './index'
import type { Code } from 'ts-macro'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  options: TransformOptions,
): Code[] {
  const { ts, ast } = options
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
          ast.text.slice(getStart(list, options), list.end),
          getStart(list, options),
        ],
        ').map(([',
        [
          String(ast.text.slice(getStart(item, options), item.end)),
          getStart(item, options),
        ],
        ', ',
        index
          ? [
              String(ast.text.slice(getStart(index, options), index.end)),
              getStart(index, options),
            ]
          : objectIndex
            ? 'undefined'
            : '',
        ...(objectIndex
          ? [
              ', ',
              [
                String(
                  ast?.text.slice(
                    getStart(objectIndex, options),
                    objectIndex.end,
                  ),
                ),
                getStart(objectIndex, options),
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
  hasVForAttribute: boolean,
): void {
  if (!nodes.length && !hasVForAttribute) return
  const { codes } = options

  nodes.forEach(({ attribute, node, parent }) => {
    const result = resolveVFor(attribute, options)
    if (parent) {
      result.unshift('{')
    }

    codes.replaceRange(
      getStart(node, options),
      getStart(node, options),
      ...result,
    )

    codes.replaceRange(node.end - 1, node.end, `>)${parent ? '}' : ''}`)

    codes.replaceRange(getStart(attribute, options), attribute.end)
  })

  codes.push(`
declare function __VLS_getVForSourceType(source: number): [number, number, number][];
declare function __VLS_getVForSourceType(source: string): [string, number, number][];
declare function __VLS_getVForSourceType<T extends any[]>(source: T): [
  item: T[number],
  key: number,
  index: number,
][];
declare function __VLS_getVForSourceType<T extends { [Symbol.iterator](): Iterator<any> }>(source: T): [
  item: T extends { [Symbol.iterator](): Iterator<infer T1> } ? T1 : never, 
  key: number,
  index: undefined,
][];
declare function __VLS_getVForSourceType<T extends number | { [Symbol.iterator](): Iterator<any> }>(source: T): [
  item: number | (Exclude<T, number> extends { [Symbol.iterator](): Iterator<infer T1> } ? T1 : never), 
  key: number,
  index: undefined,
][];
declare function __VLS_getVForSourceType<T>(source: T): [
  item: T[keyof T],
  key: keyof T,
  index: number,
][];\n`)
}
