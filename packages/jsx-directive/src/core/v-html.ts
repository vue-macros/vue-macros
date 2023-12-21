import type { MagicString } from '@vue-macros/common'
import type { JsxDirective } from '.'

export function transformVHtml(
  nodes: JsxDirective[],
  s: MagicString,
  offset: number,
  version: number,
) {
  nodes.forEach(({ attribute }) => {
    s.overwriteNode(
      attribute.name,
      version < 3 ? 'domPropsInnerHTML' : 'innerHTML',
      { offset },
    )
  })
}
