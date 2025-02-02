import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import type { CallExpression } from '@babel/types'

export function transformVueDefineExpose(
  node: CallExpression,
  s: MagicStringAST,
  lib: string,
): void {
  s.overwriteNode(
    node.callee,
    importHelperFn(s, 0, 'useExpose', '@vue-macros/jsx-macros/helpers'),
  )
  s.appendRight(
    node.arguments[0]?.start || node.end! - 1,
    `${importHelperFn(s, 0, 'getCurrentInstance', lib)}(), `,
  )
}
