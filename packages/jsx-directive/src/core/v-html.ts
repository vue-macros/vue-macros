import { type MagicString } from '@vue-macros/common'
import { type JsxDirectiveNode } from '.'

export function transformVHtml(
  nodes: JsxDirectiveNode[],
  s: MagicString,
  offset = 0,
  version: number
) {
  nodes.forEach(({ attribute }) => {
    s.overwriteNode(
      attribute.name,
      version < 3 ? 'domPropsInnerHTML' : 'innerHTML',
      { offset }
    )
  })
}
