import { replaceSourceRange } from 'muggle-string'
import { addCode, getText, isJsxExpression } from '../common'
import {
  getOpeningElement,
  getTagName,
  type JsxDirective,
  type TransformOptions,
} from './index'

export function transformCtx(
  node: JsxDirective['node'],
  root: import('typescript').Block | undefined,
  index: number,
  options: TransformOptions,
): string {
  const { ts, codes } = options

  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return ''

  if (!codes.toString().includes('function __VLS_getFunctionalComponentCtx')) {
    codes.push(`
function __VLS_getFunctionalComponentCtx<T, K, const S>(
  comp: T,
  compInstance: K,
  s: S,
): S extends keyof typeof __VLS_nativeElements
  ? { expose: (exposed: (typeof __VLS_nativeElements)[S]) => any }
  : '__ctx' extends keyof __VLS_PickNotAny<K, {}>
    ? K extends { __ctx?: infer Ctx }
      ? Ctx
      : never
    : T extends (props: infer P, ctx: infer Ctx) => any
      ? { props: P; slots: P['vSlots']; expose: P['vExpose'] } & Ctx
      : {};\n`)
  }

  let props = ''
  let refValue
  for (const prop of openingElement.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue

    let name = getText(prop.name, options)
    if (
      name === 'ref' &&
      prop.initializer &&
      isJsxExpression(prop.initializer) &&
      prop.initializer.expression
    ) {
      refValue = getRefValue(prop.initializer.expression, options)
      continue
    }

    if (name.startsWith('v-model')) {
      name = name.split('_')[0].split(':')[1] || 'modelValue'
    } else if (name.startsWith('v-')) {
      continue
    }

    const value = prop.initializer
      ? isJsxExpression(prop.initializer) && prop.initializer.expression
        ? getText(prop.initializer.expression, options)
        : getText(prop.initializer, options)
      : 'true'
    props += `'${name}': ${value},`
  }

  const ctxName = `__VLS_ctx_${refValue || index}`
  const tagName = getTagName(node, { ...options, withTypes: true })
  const result = `\nconst ${ctxName} = __VLS_getFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}), '${tagName}');\n`
  if (root) {
    replaceSourceRange(
      codes,
      options.source,
      root.end - 1,
      root.end - 1,
      result,
    )
  } else {
    addCode(codes, result)
  }

  return ctxName
}

function getRefValue(
  expression: import('typescript').Expression,
  options: TransformOptions,
) {
  const { ts } = options

  if (ts.isIdentifier(expression)) {
    return getText(expression, options)
  } else if (ts.isFunctionLike(expression)) {
    let left
    if (ts.isBinaryExpression(expression.body)) {
      left = expression.body.left
    }
    ts.forEachChild(expression.body, (node) => {
      if (ts.isBinaryExpression(node)) {
        left = node.left
      } else if (
        ts.isExpressionStatement(node) &&
        ts.isBinaryExpression(node.expression)
      ) {
        left = node.expression.left
      }
    })
    return (
      left &&
      getText(
        ts.isPropertyAccessExpression(left) ||
          ts.isElementAccessExpression(left)
          ? left.expression
          : left,
        options,
      )
    )
  } else if (
    ts.isCallExpression(expression) &&
    expression.arguments[0] &&
    ts.isIdentifier(expression.arguments[0])
  ) {
    return getText(expression.arguments[0], options)
  }
}
