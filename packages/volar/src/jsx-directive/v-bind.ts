import { getStart, getText } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVBind(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  if (nodes.length === 0) return

  const { codes } = options

  for (const { attribute } of nodes) {
    const attributeName = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    const end = attribute.name.end

    if (attributeName.includes('_')) {
      codes.replaceRange(start + attributeName.indexOf('_'), end)
    }
  }
}
