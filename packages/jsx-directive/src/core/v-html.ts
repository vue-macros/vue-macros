import type { MagicStringAST } from '@vue-macros/common'
import type { JsxDirective } from '.'

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
