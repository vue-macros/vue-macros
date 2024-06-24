import {
  HELPER_PREFIX,
  type MagicStringAST,
  importHelperFn,
} from '@vue-macros/common'
import type { JsxDirective } from '.'

export function transformVOn(
  nodes: JsxDirective[],
  s: MagicStringAST,
  offset: number,
  version: number,
): void {
  if (nodes.length > 0 && version >= 3)
    s.prependRight(
      offset,
      `const ${HELPER_PREFIX}transformVOn = (obj) => Object.entries(obj).reduce((res, [key, value]) => (res['on' + key[0].toUpperCase() + key.slice(1)] = value, res), {});`,
    )

  nodes.forEach(({ attribute }) => {
    if (version < 3) {
      s.remove(attribute.start! + offset, attribute.start! + offset + 2)
      return
    }

    s.overwriteNode(
      attribute,
      `{...${HELPER_PREFIX}transformVOn(${s.slice(
        attribute.value!.start! + offset + 1,
        attribute.value!.end! + offset - 1,
      )})}`,
      { offset },
    )
  })
}

export function transformVOnWithModifiers(
  nodes: JsxDirective[],
  s: MagicStringAST,
  offset: number,
  version: number,
): void {
  nodes.forEach(({ attribute }) => {
    const attributeName = attribute.name.name.toString()
    if (version < 3) {
      s.overwrite(
        attribute.name.start! + offset,
        attribute.name.start! + 3 + offset,
        `v-on:${attributeName[2].toLowerCase()}`,
      )

      if (!attribute.value)
        s.appendRight(attribute.name.end! + offset, '={() => {}}')
      return
    }

    let [name, ...modifiers] = attributeName.split('_')
    const withModifiersOrKeys = importHelperFn(
      s,
      offset,
      isKeyboardEvent(name) ? 'withKeys' : 'withModifiers',
      'vue',
    )

    modifiers = modifiers.filter((modifier) => {
      if (modifier === 'capture') {
        s.appendRight(
          attribute.name.end! + offset,
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
        attribute.value.expression.start! + offset,
        `${withModifiersOrKeys}(`,
      )
      s.appendLeft(attribute.value.expression.end! + offset, result)
    } else {
      s.appendRight(
        attribute.name.end! + offset,
        `={${withModifiersOrKeys}(() => {}${result}}`,
      )
    }

    s.remove(
      attribute.name.start! + name.length + offset,
      attribute.name.end! + offset,
    )
  })
}

function isKeyboardEvent(value: string) {
  return ['onKeyup', 'onKeydown', 'onKeypress'].includes(value)
}
