import { FileRangeCapabilities, replaceSourceRange } from '@vue/language-core'
import { getEmitsType } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVBind({
  nodes,
  codes,
  sfc,
  source,
}: TransformOptions & { nodes: JsxDirective[] }) {
  if (nodes.length === 0) return
  getEmitsType(codes)

  for (const { attribute } of nodes) {
    let attributeName = attribute.name.getText(sfc[source]?.ast)

    if (attributeName.includes('-')) {
      attributeName = attributeName.replaceAll(/-([A-Za-z])/g, (_, name) =>
        name.toUpperCase(),
      )
      replaceSourceRange(
        codes,
        source,
        attribute.name.getStart(sfc[source]?.ast),
        attribute.name.end,
        [
          attributeName,
          source,
          [attribute.name.getStart(sfc[source]?.ast), attribute.name.end],
          FileRangeCapabilities.full,
        ],
      )
    }

    if (attributeName.includes('_')) {
      replaceSourceRange(
        codes,
        source,
        attribute.name.getStart(sfc[source]?.ast),
        attribute.name.end,
        [
          attributeName.split('_')[0],
          source,
          [attribute.name.getStart(sfc[source]?.ast), attribute.name.end],
          FileRangeCapabilities.full,
        ],
      )
    }
  }
}
