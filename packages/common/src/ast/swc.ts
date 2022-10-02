import { parse as swcParse } from '@swc/core'
import { REGEX_JSX_FILE } from '../constants'
import { isTs } from '../lang'
import type { CallExpression, Node, ParseOptions } from '@swc/core'

export function parse(
  code: string,
  lang?: string,
  options: Partial<ParseOptions> = {}
) {
  const isJSX = !!lang && REGEX_JSX_FILE.test(lang)
  let parseOptions: ParseOptions = {
    syntax: 'ecmascript',
    jsx: isJSX,
  }

  if (lang && isTs(lang)) {
    parseOptions = {
      syntax: 'typescript',
      tsx: isJSX,
    }
  }

  return swcParse(code, {
    ...parseOptions,
    ...options,
  })
}

export function isCallExpression(
  node: Node | null | undefined
): node is CallExpression {
  return !!node && node.type === 'CallExpression'
}

export function isCallOf(
  node: Node | null | undefined,
  test: string | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    isCallExpression(node) &&
    node.callee.type === 'Identifier' &&
    (typeof test === 'string'
      ? node.callee.value === test
      : test(node.callee.value))
  )
}
