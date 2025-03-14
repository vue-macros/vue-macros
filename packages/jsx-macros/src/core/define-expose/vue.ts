import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import { useExposeHelperId } from '../helper'
import type { CallExpression } from '@babel/types'

export function transformVueDefineExpose(
  node: CallExpression,
  s: MagicStringAST,
  lib: string,
): void {
  s.overwriteNode(
    node.callee,
    importHelperFn(s, 0, 'useExpose', undefined, useExposeHelperId),
  )
  s.appendRight(
    node.arguments[0]?.start || node.end! - 1,
    lib.includes('vapor')
      ? `${importHelperFn(s, 0, 'currentInstance')}, `
      : `${importHelperFn(s, 0, 'getCurrentInstance')}(), `,
  )
}
