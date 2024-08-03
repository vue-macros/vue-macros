import { isVue2, type JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVHtml(
  nodes: JsxDirective[],
  s: MagicStringAST,
  version: number,
): void {
  nodes.forEach(({ attribute }) => {
    s.overwriteNode(
      attribute.name,
      isVue2(version) ? 'domPropsInnerHTML' : 'innerHTML',
    )
  })
}
