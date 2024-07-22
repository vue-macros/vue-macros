import { type Code, allCodeFeatures } from '@vue/language-core'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVBind(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  if (nodes.length === 0) return

  const { codes, ts, source } = options

  for (const { attribute } of nodes) {
    const attributeName = getText(attribute.name, options)
    const start = getStart(attribute.name, options)
    const end = attribute.name.end

    if (
      attributeName.includes('-') &&
      attribute.initializer &&
      !ts.isStringLiteral(attribute.initializer)
    ) {
      replaceSourceRange(
        codes,
        source,
        start,
        end,
        ...(attributeName
          .split('_')[0]
          .split('-')
          .map((code, index, codes) => [
            index ? code.at(0)?.toUpperCase() + code.slice(1) : code,
            source,
            start + (index && codes[index - 1].length + 1),
            allCodeFeatures,
          ]) as Code[]),
      )
    }
  }
}
