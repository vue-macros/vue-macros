import type { JSXAttribute } from '@babel/types'
import type { MagicStringAST } from '@vue-macros/common'

const dynamicModelRE = /^\$(.*)\$(?:_(.*))?/
export function transformVModel(
  attribute: JSXAttribute,
  s: MagicStringAST,
): void {
  if (
    attribute.name.type === 'JSXNamespacedName' &&
    attribute.value?.type === 'JSXExpressionContainer'
  ) {
    const matched = attribute.name.name.name.match(dynamicModelRE)
    if (!matched) return

    let [, argument, modifiers] = matched
    argument = argument.replaceAll('_', '.')
    modifiers = modifiers
      ? `, [${argument} + "Modifiers"]: { ${modifiers
          .split('_')
          .map((key) => `${key}: true`)
          .join(', ')} }`
      : ''
    s.replaceRange(
      attribute.start!,
      attribute.end!,
      `{...{[${argument}]: `,
      attribute.value.expression,
      `, ["onUpdate:" + ${argument}]: $event => `,
      s.sliceNode(attribute.value.expression),
      ` = $event${modifiers}}}`,
    )
  }
}
