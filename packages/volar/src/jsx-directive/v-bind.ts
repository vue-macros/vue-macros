import { replaceSourceRange } from 'muggle-string'
import { getStart, getText } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVBind(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  if (nodes.length === 0) return

  const { codes, source } = options

  for (const { attribute } of nodes) {
    const attributeName = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    const end = attribute.name.end

    if (attributeName.includes('_')) {
      replaceSourceRange(codes, source, start + attributeName.indexOf('_'), end)
    }
  }
}
