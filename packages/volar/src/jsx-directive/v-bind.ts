import type { JsxDirective, TransformOptions } from './index'

export function transformVBind(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  if (nodes.length === 0) return

  const { codes, ast } = options

  for (const { attribute } of nodes) {
    const attributeName = attribute.name.getText(ast)
    const start = attribute.name.getStart(ast)
    const end = attribute.name.end

    if (attributeName.includes('_')) {
      codes.replaceRange(start + attributeName.indexOf('_'), end)
    }
  }
}
