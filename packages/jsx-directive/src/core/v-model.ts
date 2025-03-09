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
    const value = s.sliceNode(attribute.value.expression)
    modifiers = modifiers
      ? `, [${argument} + "Modifiers"]: { ${modifiers
          .split('_')
          .map((key) => `${key}: true`)
          .join(', ')} }`
      : ''
    s.overwriteNode(
      attribute,
      `{...{[${argument}]: ${value}, ["onUpdate:" + ${argument}]: $event => ${value} = $event${modifiers}}}`,
    )
  }
}
