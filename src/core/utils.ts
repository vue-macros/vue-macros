import { parse, walkIdentifiers } from 'vue/compiler-sfc'
import { parse as babelParse } from '@babel/parser'
import { DEFINE_OPTIONS_NAME } from './constants'
import type { SFCScriptBlock } from 'vue/compiler-sfc'
import type { ParserOptions } from '@babel/parser'
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
  const {
    descriptor: { script, scriptSetup, source },
  } = parse(code, {
    filename: id,
  })

  return { script, scriptSetup, source }
}

export const parseScriptSetup = (scriptSetup: SFCScriptBlock) => {
  const parserOptions: ParserOptions = {
    sourceType: 'module',
    plugins: [],
  }
  const lang = scriptSetup.attrs.lang || 'js'
  if (lang === 'ts') parserOptions.plugins!.push('typescript')
  else if (lang === 'jsx') parserOptions.plugins!.push('jsx')
  else if (lang === 'tsx') parserOptions.plugins!.push('typescript', 'jsx')
  else if (lang !== 'js')
    throw new SyntaxError(`Unsupported script language: ${lang}`)
  scriptSetup.scriptSetupAst = babelParse(
    scriptSetup.content,
    parserOptions
  ).program.body
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
  method: string
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
    throw new SyntaxError(
      `\`${method}()\` in <script setup> cannot reference locally ` +
        `declared variables because it will be hoisted outside of the ` +
        `setup() function.`
    )
  })
}
