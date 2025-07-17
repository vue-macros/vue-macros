import type { JsxDirective, TransformOptions } from './index'

export function transformVIf(
  nodes: JsxDirective[],
  options: TransformOptions,
): void {
  const { codes, ts, prefix, ast } = options

  nodes.forEach(({ node, attribute, parent }, index) => {
    if (!ts.isIdentifier(attribute.name)) return

    if (
      [`${prefix}if`, `${prefix}else-if`].includes(
        attribute.name.getText(ast),
      ) &&
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      const hasScope = parent && attribute.name.text === `${prefix}if`
      codes.replaceRange(
        node.getStart(ast),
        node.getStart(ast),
        `${hasScope ? '{' : ''}(`,
        [
          attribute.initializer.expression.getText(ast),
          attribute.initializer.expression.getStart(ast),
        ],
        ') ? ',
      )

      const nextAttribute = nodes[index + 1]?.attribute
      const nextNodeHasElse =
        nextAttribute && ts.isIdentifier(nextAttribute.name)
          ? String(nextAttribute.name.text).startsWith(`${prefix}else`)
          : false
      codes.replaceRange(
        node.end,
        node.end,
        nextNodeHasElse ? ' : ' : ` : null${parent ? '}' : ''}`,
      )
    } else if (attribute.name.text === `${prefix}else`) {
      codes.replaceRange(node.end, node.end, parent ? '}' : '')
    }

    codes.replaceRange(attribute.getStart(ast), attribute.end)
  })
}
