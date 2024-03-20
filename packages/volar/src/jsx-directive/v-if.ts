import { FileRangeCapabilities, replaceSourceRange } from '@vue/language-core'
import type { JsxDirective, TransformOptions } from './index'

export function transformVIf({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxDirective[] }) {
  nodes.forEach(({ node, attribute, parent }, index) => {
    if (!ts.isIdentifier(attribute.name)) return

    if (
      ['v-if', 'v-else-if'].includes(
        attribute.name.getText(sfc[source]?.ast),
      ) &&
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      const hasScope = parent && attribute.name.escapedText === 'v-if'
      const expressionText = attribute.initializer.expression.getText(
        sfc[source]?.ast,
      )
      replaceSourceRange(
        codes,
        source,
        node.pos,
        node.pos,
        `${hasScope ? '{' : ' '}(`,
        [
          expressionText,
          source,
          attribute.initializer.expression.getStart(sfc[source]?.ast),
          FileRangeCapabilities.full,
        ],
        ') ? ',
      )

      const nextAttribute = nodes[index + 1]?.attribute
      const nextNodeHasElse =
        nextAttribute && ts.isIdentifier(nextAttribute.name)
          ? `${nextAttribute.name.escapedText}`.startsWith('v-else')
          : false
      replaceSourceRange(
        codes,
        source,
        node.end,
        node.end,
        nextNodeHasElse ? ' : ' : ` : null${parent ? '}' : ''}`,
      )
    } else if (attribute.name.escapedText === 'v-else') {
      replaceSourceRange(codes, source, node.end, node.end, parent ? '}' : '')
    }

    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  })
}
