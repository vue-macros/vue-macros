import {
  HELPER_PREFIX,
  type MagicString,
  importHelperFn,
} from '@vue-macros/common'
import { type JsxDirectiveNode } from '.'

export function transformVMemo(
  nodes: (JsxDirectiveNode & {
    vForAttribute?: JsxDirectiveNode['attribute']
  })[],
  s: MagicString,
  offset = 0
) {
  if (nodes.length > 0) {
    importHelperFn(s, offset, 'withMemo', 'vue')
    s.prependRight(offset, `const ${HELPER_PREFIX}cache = [];`)
  }

  nodes.forEach(({ node, attribute, parent, vForAttribute }, _index) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)

    s.appendLeft(
      node.start! + offset,
      `${hasScope ? '{' : ''}${HELPER_PREFIX}withMemo(${
        attribute.value
          ? s.slice(
              attribute.value.start! + offset + 1,
              attribute.value.end! + offset - 1
            )
          : `[]`
      }, () => `
    )

    let index = `${_index}`
    let cache = `${HELPER_PREFIX}cache`
    if (vForAttribute?.matched) {
      cache += `[${index}]`
      s.appendRight(offset, `${cache} = [];`)
      index += ` + ${vForAttribute.matched[2]} + 1`
    }
    s.prependRight(
      node.end! + offset,
      `, ${cache}, ${index})${hasScope ? '}' : ''}`
    )

    s.remove(attribute.start! + offset - 1, attribute.end! + offset)
  })
}
