import { HELPER_PREFIX, type MagicString } from '@vue-macros/common'
import type { JsxDirective } from '.'

export function transformVOn(
  nodes: JsxDirective[],
  s: MagicString,
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
