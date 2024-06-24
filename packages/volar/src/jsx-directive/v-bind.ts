import { allCodeFeatures, replaceSourceRange } from '@vue/language-core'
import { camelize } from '@vue/shared'
import { getStart, getText } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVBind(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  if (nodes.length === 0) return

  const { codes, ts, source } = options

  for (const { attribute } of nodes) {
    let attributeName = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    const end = attribute.name.end

    if (
      attributeName.includes('-') &&
      attribute.initializer &&
      !ts.isStringLiteral(attribute.initializer)
    ) {
      attributeName = camelize(attributeName)
      replaceSourceRange(codes, source, start, end, [
        attributeName,
        source,
        start,
        allCodeFeatures,
      ])
    }

    if (attributeName.includes('_')) {
      replaceSourceRange(codes, source, start, end, [
        attributeName.split('_')[0],
        source,
        start,
        allCodeFeatures,
      ])
    }
  }
}
