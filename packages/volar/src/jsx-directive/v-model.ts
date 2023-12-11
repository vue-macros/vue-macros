import { replaceSourceRange } from '@vue/language-core'
import type { JsxAttributeNode, TransformOptions } from './index'

export function transformVModel({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  nodes.forEach(({ attribute }) => {
    const start = attribute.getStart(sfc[source]?.ast)
    let end = start + 7
    let name = 'modelValue'

    if (ts.isJsxNamespacedName(attribute.name)) {
      name = attribute.name.name.getText(sfc[source]?.ast)
      end += 1 + name.length
    }

    replaceSourceRange(
      codes,
      source,
      start,
      end,
      `onUpdate:${name}={() => {}} `,
      name,
    )
  })
}
