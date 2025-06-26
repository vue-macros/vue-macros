import { replaceSourceRange } from 'muggle-string'
import { allCodeFeatures } from 'ts-macro'
import { getStart, getText, isJsxExpression } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export function transformVIf(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  const { codes, ts, source, prefix } = options

  nodes.forEach(({ node, attribute, parent }, index) => {
    if (!ts.isIdentifier(attribute.name)) return

    if (
      [`${prefix}if`, `${prefix}else-if`].includes(
        getText(attribute.name, options),
      ) &&
      isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      const hasScope = parent && attribute.name.escapedText === `${prefix}if`
      replaceSourceRange(
        codes,
        source,
        getStart(node, options),
        getStart(node, options),
        `${hasScope ? '{' : ''}(`,
        [
          getText(attribute.initializer.expression, options),
          source,
          getStart(attribute.initializer.expression, options),
          allCodeFeatures,
        ],
        ') ? ',
      )

      const nextAttribute = nodes[index + 1]?.attribute
      const nextNodeHasElse =
        nextAttribute && ts.isIdentifier(nextAttribute.name)
          ? String(nextAttribute.name.escapedText).startsWith(`${prefix}else`)
          : false
      replaceSourceRange(
        codes,
        source,
        node.end,
        node.end,
        nextNodeHasElse ? ' : ' : ` : null${parent ? '}' : ''}`,
      )
    } else if (attribute.name.escapedText === `${prefix}else`) {
      replaceSourceRange(codes, source, node.end, node.end, parent ? '}' : '')
    }

    replaceSourceRange(
      codes,
      source,
      getStart(attribute, options),
      attribute.end,
    )
  })
}
