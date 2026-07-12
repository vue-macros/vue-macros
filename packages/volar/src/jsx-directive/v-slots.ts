import type { JsxDirective, TransformOptions } from '.'

export function transformVSlots(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  const { codes, ts } = options

  for (const {
    node,
    attribute: { initializer },
  } of nodes) {
    if (
      initializer &&
      ts.isJsxExpression(initializer) &&
      initializer.expression
    ) {
      if (ts.isObjectLiteralExpression(initializer.expression)) {
        codes.replaceRange(
          initializer.expression.end,
          initializer.expression.end,
          ` satisfies typeof ${ctxMap.get(node)}.slots`,
        )
      } else if (
        ts.isFunctionExpression(initializer.expression) ||
        ts.isArrowFunction(initializer.expression)
      ) {
        codes.replaceRange(
          initializer.expression.pos,
          initializer.expression.pos,
          '(',
        )
        codes.replaceRange(
          initializer.expression.end,
          initializer.expression.end,
          `) satisfies typeof ${ctxMap.get(node)}.slots.default`,
        )
      }
    }
  }
}
