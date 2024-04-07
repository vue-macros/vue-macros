import { FileRangeCapabilities, replaceSourceRange } from '@vue/language-core'
import type { JsxDirective, TransformOptions } from './index'

export function transformVOn(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  { codes, source }: TransformOptions,
) {
  if (nodes.length === 0) return

  for (const { node, attribute } of nodes) {
    replaceSourceRange(
      codes,
      source,
      attribute.getEnd() - 1,
      attribute.getEnd() - 1,
      ` satisfies __VLS_NormalizeEmits<typeof ${ctxMap.get(node)}.emit>`,
    )
  }
}

export function transformVOnWithModifiers(
  nodes: JsxDirective[],
  { codes, sfc, source }: TransformOptions,
) {
  for (const { attribute } of nodes) {
    const attributeName = attribute.name.getText(sfc[source]?.ast).split('_')[0]
    replaceSourceRange(
      codes,
      source,
      attribute.name.getStart(sfc[source]?.ast),
      attribute.name.end,
      [
        attributeName,
        source,
        [attribute.name.getStart(sfc[source]?.ast), attribute.name.getEnd()],
        FileRangeCapabilities.full,
      ],
    )

    if (!attribute.initializer)
      replaceSourceRange(
        codes,
        source,
        attribute.name.end,
        attribute.name.end,
        '={() => {}}',
      )
  }
}
