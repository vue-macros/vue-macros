import type { JsxDirective, TransformOptions } from './index'

export function transformRef(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  const { codes, ts, ast } = options

  for (const { node, attribute } of nodes) {
    if (
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      (ts.isFunctionExpression(attribute.initializer.expression) ||
        ts.isArrowFunction(attribute.initializer.expression))
    ) {
      codes.replaceRange(
        attribute.getStart(ast),
        attribute.end,
        '{...({ ',
        ['ref', attribute.name.getStart(ast)],
        ': ',
        [
          attribute.initializer.expression.getText(ast),
          attribute.initializer.expression.getStart(ast),
        ],
        `} satisfies { ref: (e: Parameters<typeof ${ctxMap.get(node)}.expose>[0]) => any }) as {}}`,
      )
    }
  }
}
