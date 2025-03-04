import type { JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVHtml(nodes: JsxDirective[], s: MagicStringAST): void {
  nodes.forEach(({ attribute }) => {
    s.overwriteNode(attribute.name, 'innerHTML')
  })
}
