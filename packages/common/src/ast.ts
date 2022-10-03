import path from 'node:path'
import { babelParse as _babelParse, walkIdentifiers } from '@vue/compiler-sfc'
import { walk } from 'estree-walker'
import {
  MAGIC_COMMENT_STATIC,
  REGEX_JSX_FILE,
  REGEX_TS_FILE,
} from './constants'
import type { CallExpression, Literal, Node, Program } from '@babel/types'
import type { ParserOptions, ParserPlugin } from '@babel/parser'

export function getLang(filename: string) {
  return path.extname(filename).replace(/^\./, '')
}

export function isTs(lang?: string) {
  return lang && REGEX_TS_FILE.test(lang)
}

export function babelParse(
  code: string,
  lang?: string,
  options: ParserOptions = {}
): Program {
  const plugins: ParserPlugin[] = []
  if (lang) {
    if (isTs(lang)) plugins.push('typescript')
    if (REGEX_JSX_FILE.test(lang)) plugins.push('jsx')
  }
  const { program } = _babelParse(code, {
    sourceType: 'module',
    plugins,
    ...options,
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

export function isStaticExpression(node: Node): boolean {
  // magic comment
  if (
    node.leadingComments?.some(
      (comment) => comment.value.trim() === MAGIC_COMMENT_STATIC
    )
  )
    return true

  switch (node.type) {
    case 'UnaryExpression': // !true
      return isStaticExpression(node.argument)
    case 'LogicalExpression': // 1 > 2
    case 'BinaryExpression': // 1 + 2
      return isStaticExpression(node.left) && isStaticExpression(node.right)

    case 'ConditionalExpression': // 1 ? 2 : 3
      return (
        isStaticExpression(node.test) &&
        isStaticExpression(node.consequent) &&
        isStaticExpression(node.alternate)
      )

    case 'SequenceExpression': // (1, 2)
    case 'TemplateLiteral': // `123`
      return node.expressions.every((expr) => isStaticExpression(expr))

    case 'ParenthesizedExpression': // (1)
    case 'TSNonNullExpression': // 1!
    case 'TSAsExpression': // 1 as number
    case 'TSTypeAssertion': // (<number>2)
      return isStaticExpression(node.expression)
  }

  if (isLiteralType(node)) return true
  return false
}

export function isLiteralType(node: Node): node is Literal {
  return node.type.endsWith('Literal')
}

export function getStaticKey(node: Node, computed = false, raw = true) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
      return raw ? node.extra!.raw : node.value
    case 'Identifier':
      if (!computed) return raw ? `'${node.name}'` : node.name
    // break omitted intentionally
    default:
      throw new SyntaxError(`Unexpected node type: ${node.type}`)
  }
}

export function walkAST<T = Node>(
  node: T,
  options: {
    enter?: (
      this: {
        skip: () => void
        remove: () => void
        replace: (node: T) => void
      },
      node: T,
      parent: T,
      key: string,
      index: number
    ) => void
    leave?: (
      this: {
        skip: () => void
        remove: () => void
        replace: (node: T) => void
      },
      node: T,
      parent: T,
      key: string,
      index: number
    ) => void
  }
): T {
  return walk(node as any, options as any) as any
}
