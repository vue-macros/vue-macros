import { isHTMLTag, isSVGTag } from '@vue/shared'
import { addCode } from '../common'
import {
  getOpeningElement,
  getTagName,
  type JsxDirective,
  type TransformOptions,
} from './index'

export type CtxMap = Map<
  JsxDirective['node'],
  import('typescript').Block | undefined
>

export function resolveCtxMap(
  ctxNodeMap: CtxMap,
  options: TransformOptions,
): Map<import('typescript').Node, string> {
  if (ctxNodeMap.size) {
    options.codes.push(`
type __VLS_IsAny<T> = 0 extends 1 & T ? true : false;
type __VLS_PickNotAny<A, B> = __VLS_IsAny<A> extends true ? B : A;
type __VLS_PrettifyGlobal<T> = { [K in keyof T as K]: T[K] } & {};
declare function __VLS_asFunctionalComponent<
  T,
  K = T extends new (...args: any) => any ? InstanceType<T> : unknown,
>(
  t: T,
): T extends new (...args: any) => any
  ? (
      props: (K extends { $props: infer Props }
        ? Props
        : K extends { props: infer Props }
          ? Props
          : any),
      ctx?: any,
    ) => JSX.Element & {
      __ctx: {
        attrs: Record<string, any>,
        props: (K extends { $props: infer Props }
          ? Props
          : K extends { props: infer Props }
            ? Props
            : any),
        slots: K extends { $slots: infer Slots }
          ? Slots
          : K extends { slots: infer Slots }
            ? Slots
            : any
        emit: K extends { $emit: infer Emit }
          ? Emit
          : K extends { emit: infer Emit }
            ? Emit
            : any
        expose: (
          exposed: K extends { exposeProxy: infer Exposed }
            ? string extends keyof NonNullable<Exposed>
              ? K
              : Exposed
            : K,
        ) => void
      }
    }
  : T extends () => any
    ? (props: {}, ctx?: any) => ReturnType<T>
    : T extends (...args: any) => any
      ? T
      : (_: {}, ctx?: any) => {
          __ctx: {
            attrs?: any
            expose?: any
            slots?: any
            emit?: any
          } 
        };
const __VLS_nativeElements = {
  ...{} as SVGElementTagNameMap,
  ...{} as HTMLElementTagNameMap,
};
declare function __VLS_getFunctionalComponentCtx<T, K, const S>(
  comp: T,
  compInstance: K,
  s: S,
): S extends keyof typeof __VLS_nativeElements
  ? { expose: (exposed: (typeof __VLS_nativeElements)[S]) => any }
    : '__ctx' extends keyof __VLS_PickNotAny<K, {}> 
      ? K extends { __ctx?: infer Ctx } ? Ctx : never
      : T extends (props: infer P, ctx: { expose: (exposed: infer Exposed) => void } & infer Ctx) => any 
        ? Ctx & {
            props: P,
            expose: (
              exposed: __VLS_PrettifyGlobal<
                import('vue').ShallowUnwrapRef<Exposed>
              >,
            ) => void,
          }
        : {};\n`)
  }

  return new Map(
    Array.from(ctxNodeMap).map(([node, root], index) => [
      node,
      transformCtx(node, root, index, options),
    ]),
  )
}

export function transformCtx(
  node: JsxDirective['node'],
  root: import('typescript').Block | undefined,
  index: number,
  options: TransformOptions,
): string {
  const { ts, ast, codes, prefix } = options

  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return ''

  let props = ''
  let refValue
  for (const prop of openingElement.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue

    let name = prop.name.getText(ast)
    if (
      name === 'ref' &&
      prop.initializer &&
      ts.isJsxExpression(prop.initializer) &&
      prop.initializer.expression
    ) {
      refValue = getRefValue(prop.initializer.expression, options)
      continue
    }

    const prefixModel = `${prefix}model`
    if (name.startsWith(prefixModel)) {
      name = name.split('$')[0].split('_')[0].split(':')[1] ?? 'modelValue'
    } else if (name.includes('_')) {
      name = name.split('_')[0]
    } else if (prefix && name.startsWith(prefix)) {
      continue
    }
    if (!name) continue

    const value = prop.initializer
      ? ts.isJsxExpression(prop.initializer) && prop.initializer.expression
        ? prop.initializer.expression.getText(ast)
        : prop.initializer.getText(ast)
      : 'true'
    props += `'${name}': ${value},`
  }

  const ctxName = `__VLS_ctx_${refValue || index}`
  let tagName = ''
  const originTagName = (tagName = getTagName(node, options))
  if (isHTMLTag(tagName) || isSVGTag(tagName) || tagName.includes('-')) {
    tagName = `{}`
  } else {
    let types = ''
    if (openingElement.typeArguments?.length) {
      types = `<${openingElement.typeArguments
        .map((argument) => argument.getText(ast))
        .join(', ')}>`
      tagName += types
    }
  }
  const result = `\nconst ${ctxName} = __VLS_getFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}), '${originTagName}');\n`
  if (root) {
    codes.replaceRange(root.end - 1, root.end - 1, result)
  } else {
    addCode(codes, result)
  }

  return ctxName
}

function getRefValue(
  expression: import('typescript').Expression,
  options: TransformOptions,
) {
  const { ts, ast } = options

  if (ts.isIdentifier(expression)) {
    return expression.getText(ast)
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
      (ts.isPropertyAccessExpression(left) || ts.isElementAccessExpression(left)
        ? left.expression
        : left
      ).getText(ast)
    )
  } else if (
    ts.isCallExpression(expression) &&
    expression.arguments[0] &&
    ts.isIdentifier(expression.arguments[0])
  ) {
    return expression.arguments[0].getText(ast)
  }
}
