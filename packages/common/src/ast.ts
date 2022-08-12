import { babelParse as _babelParse, walkIdentifiers } from '@vue/compiler-sfc'
import type { ParserPlugin } from '@babel/parser'
import type { CallExpression, Node } from '@babel/types'

export function babelParse(code: string, lang?: string) {
  const plugins: ParserPlugin[] = []
  if (lang === 'ts' || lang === 'tsx') plugins.push('typescript')
  if (lang === 'jsx' || lang === 'tsx') plugins.push('jsx')
  const { program } = _babelParse(code, {
    sourceType: 'module',
    plugins,
  })
  return program
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
