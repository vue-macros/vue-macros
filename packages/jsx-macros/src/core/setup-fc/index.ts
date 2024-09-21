import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import type { FunctionalNode } from '..'
import { restructure } from './restructure'

export function transformSetupFC(
  node: FunctionalNode,
  s: MagicStringAST,
): void {
  const isBlockStatement = node.body.type === 'BlockStatement'
  const start = node.body.extra?.parenthesized
    ? (node.body.extra.parenStart as number)
    : node.body.start!
  if (!isBlockStatement) {
    s.appendLeft(start, '{')
  }
  const useAttrs = importHelperFn(s, 0, 'useAttrs', 'vue')
  s.appendRight(
    start + (isBlockStatement ? 1 : 0),
    `\nconst ${HELPER_PREFIX}props = ${useAttrs}();${!isBlockStatement ? 'return ' : ''}`,
  )
  if (!isBlockStatement) {
    s.appendRight(node.end!, '}')
  }

  restructure(s, node)

  if (node.params[0]) s.removeNode(node.params[0])
}
