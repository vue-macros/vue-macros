import { parse, walkIdentifiers } from 'vue/compiler-sfc'
import { DEFINE_OPTIONS_NAME } from './constants'
import type { SFCScriptBlock, BindingMetadata } from 'vue/compiler-sfc'
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

export const parseSFC = (code: string, id: string) => {
  const { descriptor } = parse(code, {
    filename: id,
  })
  return descriptor
}

export const filterMarco = (scriptSetup: SFCScriptBlock) => {
  return scriptSetup.scriptSetupAst
    .map((raw: Node) => {
      let node = raw
      if (raw.type === 'ExpressionStatement') node = raw.expression
      return isCallOf(node, DEFINE_OPTIONS_NAME) ? node : undefined
    })
    .filter((node) => !!node)
}

export function checkInvalidScopeReference(
  node: Node | undefined,
  method: string,
  bindings: BindingMetadata
) {
  if (!node) return
  walkIdentifiers(node, (id, parent, parentStack) => {
    if (
      parentStack.some(
        (node) =>
          node.type === 'ObjectMethod' ||
          node.type === 'ArrowFunctionExpression' ||
          node.type === 'FunctionExpression'
      )
    ) {
      return
    }
    if (Object.keys(bindings).includes(id.name))
      throw new SyntaxError(
        `\`${method}()\` in <script setup> cannot reference locally ` +
          `declared variables because it will be hoisted outside of the ` +
          `setup() function.`
      )
  })
}
