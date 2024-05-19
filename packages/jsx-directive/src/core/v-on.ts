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
) {
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
) {
  let withModifiers: string
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

    if (!withModifiers)
      withModifiers = importHelperFn(s, offset, 'withModifiers', 'vue')

    let [name, ...modifiers] = attributeName.split('_')
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

    s.remove(
      attribute.name.start! + name.length + offset,
      attribute.name.end! + offset,
    )

    if (attribute.value?.type === 'JSXExpressionContainer') {
      s.appendRight(
        attribute.value.expression.start! + offset,
        `${withModifiers}(`,
      )
      s.appendLeft(
        attribute.value.expression.end! + offset,
        `,[${modifiers.map((modifier) => `'${modifier}'`).join(',')}])`,
      )
    } else {
      s.appendRight(
        attribute.name.end! + offset,
        `={${withModifiers}(() => {}, [${modifiers
          .map((modifier) => `'${modifier}'`)
          .join(',')}])}`,
      )
    }
  })
}
