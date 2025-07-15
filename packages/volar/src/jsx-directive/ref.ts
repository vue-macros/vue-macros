import { getStart, getText, isJsxExpression } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformRef(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  const { codes, ts } = options

  for (const { node, attribute } of nodes) {
    if (
      attribute.initializer &&
      isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression &&
      (ts.isFunctionExpression(attribute.initializer.expression) ||
        ts.isArrowFunction(attribute.initializer.expression))
    ) {
      codes.replaceRange(
        getStart(attribute, options),
        attribute.end,
        '{...({ ',
        ['ref', getStart(attribute.name, options)],
        ': ',
        [
          getText(attribute.initializer.expression, options),
          getStart(attribute.initializer.expression, options),
        ],
        `} satisfies { ref: (e: Parameters<typeof ${ctxMap.get(node)}.expose>[0]) => any }) as {}}`,
      )
    }
  }
}
