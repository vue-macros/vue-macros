import { babelParse as _babelParse, walkIdentifiers } from '@vue/compiler-sfc'
// @ts-ignore error in node CJS (volar tsconfig)
import { walk } from 'estree-walker'
import {
  type CallExpression,
  type Function,
  type Literal,
  type Node,
  type ObjectExpression,
  type ObjectMethod,
  type ObjectProperty,
  type Program,
  type TemplateLiteral,
} from '@babel/types'
import { type ParserOptions, type ParserPlugin } from '@babel/parser'
import { type MagicStringBase } from 'magic-string-ast'
import { isTs } from './lang'
import { REGEX_LANG_JSX } from './constants'

export function babelParse(
  code: string,
  lang?: string,
  options: ParserOptions = {}
): Program {
  const plugins: ParserPlugin[] = [...(options.plugins || [])]
  if (isTs(lang)) {
    plugins.push(['typescript', { dts: lang === 'dts' }])
    if (REGEX_LANG_JSX.test(lang!)) plugins.push('jsx')
    if (!plugins.includes('decorators')) plugins.push('decorators-legacy')
  } else {
    plugins.push('jsx')
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
  test: string | string[] | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (typeof test === 'string'
      ? node.callee.name === test
      : Array.isArray(test)
      ? test.includes(node.callee.name)
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

export function isStaticExpression(
  node: Node,
  options: Partial<
    Record<
      'object' | 'fn' | 'objectMethod' | 'array' | 'unary' | 'regex',
      boolean
    > & {
      magicComment?: string
    }
  > = {}
): boolean {
  const { magicComment, fn, object, objectMethod, array, unary, regex } =
    options

  // magic comment
  if (
    magicComment &&
    node.leadingComments?.some(
      (comment) => comment.value.trim() === magicComment
    )
  )
    return true
  else if (fn && isFunctionType(node)) return true

  switch (node.type) {
    case 'UnaryExpression': // !true
      return !!unary && isStaticExpression(node.argument, options)

    case 'LogicalExpression': // 1 > 2
    case 'BinaryExpression': // 1 + 2
      return (
        isStaticExpression(node.left, options) &&
        isStaticExpression(node.right, options)
      )

    case 'ConditionalExpression': // 1 ? 2 : 3
      return (
        isStaticExpression(node.test, options) &&
        isStaticExpression(node.consequent, options) &&
        isStaticExpression(node.alternate, options)
      )

    case 'SequenceExpression': // (1, 2)
    case 'TemplateLiteral': // `123`
      return node.expressions.every((expr) => isStaticExpression(expr, options))

    case 'ArrayExpression': // [1, 2]
      return (
        !!array &&
        node.elements.every(
          (element) => element && isStaticExpression(element, options)
        )
      )

    case 'ObjectExpression': // { foo: 1 }
      return (
        !!object &&
        node.properties.every((prop) => {
          if (prop.type === 'SpreadElement') {
            return (
              prop.argument.type === 'ObjectExpression' &&
              isStaticExpression(prop.argument, options)
            )
          } else if (!isLiteralType(prop.key) && prop.computed) {
            return false
          } else if (
            prop.type === 'ObjectProperty' &&
            !isStaticExpression(prop.value, options)
          ) {
            return false
          }
          if (prop.type === 'ObjectMethod' && !objectMethod) {
            return false
          }
          return true
        })
      )

    case 'ParenthesizedExpression': // (1)
    case 'TSNonNullExpression': // 1!
    case 'TSAsExpression': // 1 as number
    case 'TSTypeAssertion': // (<number>2)
    case 'TSSatisfiesExpression': // 1 satisfies number
      return isStaticExpression(node.expression, options)

    case 'RegExpLiteral':
      return !!regex
  }

  if (isLiteralType(node)) return true
  return false
}

export function isLiteralType(node: Node): node is Literal {
  return node.type.endsWith('Literal')
}

export function resolveTemplateLiteral(node: TemplateLiteral) {
  return node.quasis.reduce((prev, curr, idx) => {
    if (node.expressions[idx]) {
      return (
        prev +
        curr.value.cooked +
        resolveLiteral(node.expressions[idx] as Literal)
      )
    }
    return prev + curr.value.cooked
  }, '')
}

export function resolveLiteral(
  node: Literal
): string | number | boolean | null | RegExp | bigint {
  switch (node.type) {
    case 'TemplateLiteral':
      return resolveTemplateLiteral(node)
    case 'NullLiteral':
      return null
    case 'BigIntLiteral':
      return BigInt(node.value)
    case 'RegExpLiteral':
      return new RegExp(node.pattern, node.flags)

    case 'BooleanLiteral':
    case 'NumericLiteral':
    case 'StringLiteral':
      return node.value
  }
  return undefined as never
}

export function isStaticObjectKey(node: ObjectExpression): boolean {
  return node.properties.every((prop) => {
    if (prop.type === 'SpreadElement') {
      return (
        prop.argument.type === 'ObjectExpression' &&
        isStaticObjectKey(prop.argument)
      )
    }
    return !prop.computed || isLiteralType(prop.key)
  })
}

/**
 * @param node must be a static expression, SpreadElement is not supported
 */
export function resolveObjectExpression(node: ObjectExpression) {
  const maps: Record<string | number, ObjectMethod | ObjectProperty> = {}
  for (const property of node.properties) {
    if (property.type === 'SpreadElement') {
      if (property.argument.type !== 'ObjectExpression')
        // not supported
        return undefined
      Object.assign(maps, resolveObjectExpression(property.argument)!)
    } else {
      const key = resolveObjectKey(property.key, property.computed, false)
      maps[key] = property
    }
  }

  return maps
}

export function resolveObjectKey(
  node: Node,
  computed?: boolean,
  raw?: true
): string
export function resolveObjectKey(
  node: Node,
  computed: boolean | undefined,
  raw: false
): string | number
export function resolveObjectKey(node: Node, computed = false, raw = true) {
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

export function isFunctionType(node: Node): node is Function {
  return /Function(?:Expression|Declaration)$|Method$/.test(node.type)
}

export const TS_NODE_TYPES = [
  'TSAsExpression', // foo as number
  'TSTypeAssertion', // (<number>foo)
  'TSNonNullExpression', // foo!
  'TSInstantiationExpression', // foo<string>
  'TSSatisfiesExpression', // foo satisfies T
]
export function unwrapTSNode(node: Node): Node {
  if (TS_NODE_TYPES.includes(node.type)) {
    return unwrapTSNode((node as any).expression)
  } else {
    return node
  }
}

const importedMap = new WeakMap<MagicStringBase, Set<string>>()
export const HELPER_PREFIX = '__MACROS_'
export function importHelperFn(
  s: MagicStringBase,
  offset: number,
  local: string,
  from = 'vue',
  isDefault = false
) {
  const imported = isDefault ? 'default' : local
  const cacheKey = `${from}@${imported}`
  if (!importedMap.get(s)?.has(cacheKey)) {
    s.appendLeft(
      offset,
      `\nimport ${
        isDefault
          ? HELPER_PREFIX + local
          : `{ ${imported} as ${HELPER_PREFIX + local} }`
      } from ${JSON.stringify(from)};`
    )
    if (!importedMap.has(s)) {
      importedMap.set(s, new Set([cacheKey]))
    } else {
      importedMap.get(s)!.add(cacheKey)
    }
  }

  return `${HELPER_PREFIX}${local}`
}
