import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import type { OptionsResolved } from './plugin'
import type { JsxDirective } from '.'

export function transformVOn(nodes: JsxDirective[], s: MagicStringAST): void {
  if (nodes.length > 0)
    s.prependRight(
      0,
      `const ${HELPER_PREFIX}transformVOn = (obj) => Object.entries(obj).reduce((res, [key, value]) => (res['on' + key[0].toUpperCase() + key.slice(1)] = value, res), {});`,
    )

  nodes.forEach(({ attribute }) => {
    if (attribute.value?.type === 'JSXExpressionContainer') {
      s.replaceRange(
        attribute.start!,
        attribute.end!,
        `{...${HELPER_PREFIX}transformVOn(`,
        attribute.value.expression,
        `)}`,
      )
    }
  })
}

export function transformOnWithModifiers(
  nodes: JsxDirective[],
  s: MagicStringAST,
  { lib }: OptionsResolved,
): void {
  nodes.forEach(({ attribute }) => {
    const attributeName = attribute.name.name.toString()

    let [name, ...modifiers] = attributeName.split('_')
    const withModifiersOrKeys = importHelperFn(
      s,
      0,
      isKeyboardEvent(name) ? 'withKeys' : 'withModifiers',
      undefined,
      lib.startsWith('vue') ? 'vue' : '@vue-macros/jsx-directive/helpers',
    )

    modifiers = modifiers.filter((modifier) => {
      if (modifier === 'capture') {
        s.appendRight(
          attribute.name.end!,
          modifier[0].toUpperCase() + modifier.slice(1),
        )
        return false
      } else {
        return true
      }
    })

    const result = `, [${modifiers.map((modifier) => `'${modifier}'`)}])`
    if (attribute.value?.type === 'JSXExpressionContainer') {
      s.appendRight(
        attribute.value.expression.start!,
        `${withModifiersOrKeys}(`,
      )
      s.appendLeft(attribute.value.expression.end!, result)
    } else {
      s.appendRight(
        attribute.name.end!,
        `={${withModifiersOrKeys}(() => {}${result}}`,
      )
    }

    s.replaceRange(attribute.name.start! + name.length, attribute.name.end!)
  })
}

function isKeyboardEvent(value: string) {
  return ['onKeyup', 'onKeydown', 'onKeypress'].includes(value)
}
