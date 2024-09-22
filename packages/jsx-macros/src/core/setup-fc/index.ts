import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicString,
  type MagicStringAST,
} from '@vue-macros/common'
import type { FunctionalNode } from '..'
import { restructure } from './restructure'

export function prependFunctionalNode(
  node: FunctionalNode,
  s: MagicString,
  result: string,
): void {
  const isBlockStatement = node.body.type === 'BlockStatement'
  const start = node.body.extra?.parenthesized
    ? (node.body.extra.parenStart as number)
    : node.body.start!
  s.appendRight(
    start + (isBlockStatement ? 1 : 0),
    `${result};${!isBlockStatement ? 'return ' : ''}`,
  )
  if (!isBlockStatement) {
    s.appendLeft(start, '{')
    s.appendRight(node.end!, '}')
  }
}

export function transformSetupFC(
  node: FunctionalNode,
  s: MagicStringAST,
  lib: string,
): void {
  const useAttrs = importHelperFn(s, 0, 'useAttrs', 'vue')
  prependFunctionalNode(
    node,
    s,
    `\nconst ${HELPER_PREFIX}props = ${useAttrs}()`,
  )

  restructure(s, node)

  if (node.params[0]) s.removeNode(node.params[0])

  if (lib !== 'vue') return

  if (node.body.type === 'BlockStatement') {
    const returnStatement = node.body.body.find(
      (node) => node.type === 'ReturnStatement',
    )
    if (
      returnStatement &&
      returnStatement.argument &&
      !(
        returnStatement.argument?.type === 'ArrowFunctionExpression' ||
        returnStatement.argument?.type === 'FunctionExpression'
      )
    ) {
      s.appendRight(
        returnStatement.argument.extra?.parenthesized
          ? (returnStatement.argument.extra.parenStart as number)
          : returnStatement.argument.start!,
        '() => ',
      )
    }
  } else {
    s.appendRight(
      node.body.extra?.parenthesized
        ? (node.body.extra.parenStart as number)
        : node.body.start!,
      '() => ',
    )
  }
}
