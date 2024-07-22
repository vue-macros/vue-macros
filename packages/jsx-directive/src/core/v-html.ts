import type { JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVHtml(
  nodes: JsxDirective[],
  s: MagicStringAST,
  offset: number,
  version: number,
): void {
  nodes.forEach(({ attribute }) => {
    s.overwriteNode(
      attribute.name,
      version < 3 ? 'domPropsInnerHTML' : 'innerHTML',
      { offset },
    )
  })
}
