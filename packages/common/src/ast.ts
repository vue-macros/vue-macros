import { parse, walkIdentifiers } from '@vue/compiler-sfc'
import type { SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'
import type { CallExpression, Node } from '@babel/types'

export const parseSFC = (code: string, id: string): SFCDescriptor => {
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

export function checkInvalidScopeReference(
  node: Node | undefined,
  method: string,
  scriptSetup: SFCScriptBlock
) {
  if (!node) return
  walkIdentifiers(node, (id) => {
    if (
      Object.keys(scriptSetup.bindings!).includes(id.name) &&
      !Object.keys(scriptSetup.imports!).includes(id.name)
    )
      throw new SyntaxError(
        `\`${method}()\` in <script setup> cannot reference locally ` +
          `declared variables because it will be hoisted outside of the ` +
          `setup() function.`
      )
  })
}
