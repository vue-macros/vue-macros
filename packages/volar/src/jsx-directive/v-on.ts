import { replaceSourceRange } from 'muggle-string'
import { allCodeFeatures } from 'ts-macro'
import { getStart, getText, isJsxExpression } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVOn(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  if (nodes.length === 0) return
  const { codes, source } = options

  for (const { node, attribute } of nodes) {
    replaceSourceRange(
      codes,
      source,
      getStart(attribute, options),
      attribute.name.end + 2,
      '{...',
    )
    replaceSourceRange(
      codes,
      source,
      attribute.end - 1,
      attribute.end - 1,
      ` satisfies __VLS_NormalizeEmits<typeof ${ctxMap.get(node)}.emit>`,
    )
  }

  codes.push(`
type __VLS_UnionToIntersection<U> = (U extends unknown ? (arg: U) => unknown : never) extends ((arg: infer P) => unknown) ? P : never;
type __VLS_OverloadUnionInner<T, U = unknown> = U & T extends (...args: infer A) => infer R
  ? U extends T
  ? never
  : __VLS_OverloadUnionInner<T, Pick<T, keyof T> & U & ((...args: A) => R)> | ((...args: A) => R)
  : never;
type __VLS_OverloadUnion<T> = Exclude<
  __VLS_OverloadUnionInner<(() => never) & T>,
  T extends () => never ? never : () => never
>;
type __VLS_ConstructorOverloads<T> = __VLS_OverloadUnion<T> extends infer F
  ? F extends (event: infer E, ...args: infer A) => any
  ? { [K in E & string]: (...args: A) => void; }
  : never
  : never;
type __VLS_NormalizeEmits<T> = __VLS_PrettifyGlobal<
  __VLS_UnionToIntersection<
    __VLS_ConstructorOverloads<T> & {
      [K in keyof T]: T[K] extends any[] ? { (...args: T[K]): void } : never
    }
  >
>;
type __VLS_PrettifyGlobal<T> = { [K in keyof T]: T[K]; } & {};\n`)
}

export function transformOnWithModifiers(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  const { codes, source } = options

  for (const { attribute } of nodes) {
    const attributeName = getText(attribute.name, options).split('_')[0]
    const start = getStart(attribute.name, options)
    const end = attribute.name.end

    replaceSourceRange(codes, source, start, end, '{...{', [
      attributeName,
      source,
      start,
      allCodeFeatures,
    ])

    if (!attribute.initializer) {
      replaceSourceRange(codes, source, end, end, ': () => {}}}')
    } else if (
      isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      replaceSourceRange(
        codes,
        source,
        end,
        getStart(attribute.initializer.expression, options),
        ': ',
      )

      replaceSourceRange(codes, source, attribute.end, attribute.end, '}')
    }
  }
}
