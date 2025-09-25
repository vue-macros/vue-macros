import type { JsxDirective, TransformOptions } from './index'
import type { Code } from 'ts-macro'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  options: TransformOptions,
): Code[] {
  const { ts, ast } = options
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
        [ast.text.slice(list.getStart(ast), list.end), list.getStart(ast)],
        ').map(([',
        [
          String(ast.text.slice(item.getStart(ast), item.end)),
          item.getStart(ast),
        ],
        ', ',
        index
          ? [
              String(ast.text.slice(index.getStart(ast), index.end)),
              index.getStart(ast),
            ]
          : objectIndex
            ? 'undefined'
            : '',
        ...(objectIndex
          ? [
              ', ',
              [
                String(
                  ast?.text.slice(objectIndex.getStart(ast), objectIndex.end),
                ),
                objectIndex.getStart(ast),
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
  const { codes, ast } = options

  nodes.forEach(({ attribute, node, parent }) => {
    const result = resolveVFor(attribute, options)
    if (parent) {
      result.unshift('{')
    }

    codes.replaceRange(node.getStart(ast), node.getStart(ast), ...result)

    codes.replaceRange(node.end - 1, node.end, `>)${parent ? '}' : ''}`)

    codes.replaceRange(attribute.getStart(ast), attribute.end)
  })

  codes.push(`
// @ts-ignore
function __VLS_getVForSourceType<T extends number | string | any[] | Iterable<any>>(source: T): [
  item: T extends number ? number
    : T extends string ? string
    : T extends any[] ? T[number]
    : T extends Iterable<infer T1> ? T1
    : any,
  index: number,
][];
// @ts-ignore
function __VLS_getVForSourceType<T>(source: T): [
  item: T[keyof T],
  key: keyof T,
  index: number,
][];
`)
}
