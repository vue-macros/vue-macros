import type { JsxDirective, TransformOptions } from './index'

export function transformVOn(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  if (nodes.length === 0) return
  const { codes, ast } = options

  for (const { node, attribute } of nodes) {
    codes.replaceRange(attribute.getStart(ast), attribute.name.end + 2, '{...')
    codes.replaceRange(
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
>;\n`)
}

export function transformOnWithModifiers(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  const { codes, ast, ts } = options

  for (const { attribute } of nodes) {
    const attributeName = attribute.name.getText(ast).split('_')[0]
    const start = attribute.name.getStart(ast)
    const end = attribute.name.end

    codes.replaceRange(start, end, '{...{', [attributeName, start])

    if (!attribute.initializer) {
      codes.replaceRange(end, end, ': () => {}}}')
    } else if (
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      codes.replaceRange(
        end,
        attribute.initializer.expression.getStart(ast),
        ': ',
      )

      codes.replaceRange(attribute.end, attribute.end, '}')
    }
  }
}
