import { parse, walkIdentifiers } from '@vue/compiler-sfc'
import { DEFINE_OPTIONS_NAME } from './constants'
import type { SFCScriptBlock } from '@vue/compiler-sfc'
import type { CallExpression, Node, ObjectExpression } from '@babel/types'

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
  scriptSetup: SFCScriptBlock
) {
  if (!node) return
  walkIdentifiers(node, (id) => {
    if (
      Object.keys(scriptSetup.bindings).includes(id.name) &&
      !Object.keys(scriptSetup.imports).includes(id.name)
    )
      throw new SyntaxError(
        `\`${method}()\` in <script setup> cannot reference locally ` +
          `declared variables because it will be hoisted outside of the ` +
          `setup() function.`
      )
  })
}

export const hasPropsOrEmits = (node: ObjectExpression) =>
  node.properties.some(
    (prop) =>
      (prop.type === 'ObjectProperty' || prop.type === 'ObjectMethod') &&
      prop.key.type === 'Identifier' &&
      (prop.key.name === 'props' || prop.key.name === 'emits')
  )
