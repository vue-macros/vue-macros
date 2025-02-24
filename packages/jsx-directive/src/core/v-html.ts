import type { OptionsResolved } from '..'
import { isVue2, type JsxDirective } from '.'
import type { MagicStringAST } from '@vue-macros/common'

export function transformVHtml(
  nodes: JsxDirective[],
  s: MagicStringAST,
  { version }: OptionsResolved,
): void {
  nodes.forEach(({ attribute }) => {
    s.overwriteNode(
      attribute.name,
      isVue2(version) ? 'domPropsInnerHTML' : 'innerHTML',
    )
  })
}
