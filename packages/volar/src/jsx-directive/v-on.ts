import { allCodeFeatures, replaceSourceRange } from '@vue/language-core'
import { getStart, getText, isJsxExpression } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVOn(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  { codes, source }: TransformOptions,
): void {
  if (nodes.length === 0) return

  for (const { node, attribute } of nodes) {
    replaceSourceRange(
      codes,
      source,
      attribute.end - 1,
      attribute.end - 1,
      ` satisfies __VLS_NormalizeEmits<typeof ${ctxMap.get(node)}.emit>`,
    )
  }
}

export function transformVOnWithModifiers(
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
