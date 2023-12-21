import { replaceSourceRange } from '@vue/language-core'
import { getEmitsType } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVOn({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxDirective[] }) {
  if (nodes.length === 0) return
  getEmitsType(codes)

  for (const { node, attribute } of nodes) {
    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName.getText(sfc[source]?.ast)
      : ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(sfc[source]?.ast)
        : null
    replaceSourceRange(
      codes,
      source,
      attribute.getEnd() - 1,
      attribute.getEnd() - 1,
      ` satisfies __VLS_getEmits<typeof ${tagName}>`,
    )
  }
}
