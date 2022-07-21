import { parse } from '@vue/compiler-sfc'
import type { CallExpression, Node } from '@babel/types'

export const parseSFC = (code: string, id: string) => {
  const { descriptor } = parse(code, {
    filename: id,
  })
  return descriptor
}

export function isCallOf(
  node: Node | null | undefined,
  test: string | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (typeof test === 'string'
      ? node.callee.name === test
      : test(node.callee.name))
  )
}
