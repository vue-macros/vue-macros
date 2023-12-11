import { replaceSourceRange } from '@vue/language-core'
import type { JsxAttributeNode, TransformOptions } from './index'

export function transformVOn({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  if (nodes.length === 0) return
  codes.push(`
type __VLS_getEmits<T> = T extends new () => { $emit: infer E } ? NonNullable<E>
  : T extends (props: any, ctx: { slots: any; attrs: any; emit: infer E }, ...args: any) => any
  ? NonNullable<E>
  : {};`)

  for (const { node, attribute } of nodes) {
    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName.getText(sfc[source]?.ast)
      : ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(sfc[source]?.ast)
        : null
    if (!tagName) continue

    replaceSourceRange(
      codes,
      source,
      attribute.getEnd() - 1,
      attribute.getEnd() - 1,
      ` satisfies __VLS_NormalizeEmits<__VLS_getEmits<typeof ${tagName}>>`,
    )
  }
}
