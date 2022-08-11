import { walkIdentifiers } from '@vue/compiler-sfc'
import type { CallExpression, Node } from '@babel/types'

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

export function checkInvalidScopeReference(
  node: Node | undefined,
  method: string,
  setupBindings: string[]
) {
  if (!node) return
  walkIdentifiers(node, (id) => {
    if (setupBindings.includes(id.name))
      throw new SyntaxError(
        `\`${method}()\` in <script setup> cannot reference locally ` +
          `declared variables (${id.name}) because it will be hoisted outside of the ` +
          `setup() function.`
      )
  })
}
