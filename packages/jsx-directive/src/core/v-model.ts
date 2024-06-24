import { type MagicStringAST, importHelperFn } from '@vue-macros/common'
import type { JSXAttribute } from '@babel/types'

export function transformVModel(
  attribute: JSXAttribute,
  s: MagicStringAST,
  offset: number,
): void {
  if (
    attribute.name.type === 'JSXNamespacedName' &&
    attribute.value?.type === 'JSXExpressionContainer'
  ) {
    const matched = attribute.name.name.name.match(/^\$(.*)\$(?:_(.*))?/)
    if (!matched) return

    let [, argument, modifiers] = matched
    const value = s.sliceNode(attribute.value.expression, { offset })
    argument = `${importHelperFn(s, offset, 'unref')}(${argument})`
    modifiers = modifiers
      ? `, [${argument} + "Modifiers"]: { ${modifiers
          .split('_')
          .map((key) => `${key}: true`)
          .join(', ')} }`
      : ''
    s.overwriteNode(
      attribute,
      `{...{[${argument}]: ${value}, ["onUpdate:" + ${argument}]: $event => ${value} = $event${modifiers}}}`,
      { offset },
    )
  }
}
