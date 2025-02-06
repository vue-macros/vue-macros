import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import type { OptionsResolved } from './plugin'
import type { JSXAttribute } from '@babel/types'

export function transformVModel(
  attribute: JSXAttribute,
  s: MagicStringAST,
  { lib }: OptionsResolved,
): void {
  if (
    attribute.name.type === 'JSXNamespacedName' &&
    attribute.value?.type === 'JSXExpressionContainer'
  ) {
    const matched = attribute.name.name.name.match(/^\$(.*)\$(?:_(.*))?/)
    if (!matched) return

    let [, argument, modifiers] = matched
    const value = s.sliceNode(attribute.value.expression)
    argument = `${importHelperFn(s, 0, 'unref', lib.startsWith('vue') ? 'vue' : '@vue-macros/jsx-directive/helpers')}(${argument})`
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
