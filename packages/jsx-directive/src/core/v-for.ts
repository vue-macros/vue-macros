import { HELPER_PREFIX, type MagicString } from '@vue-macros/common'
import { type JsxDirectiveNode } from '.'

export function transformVFor(
  nodes: JsxDirectiveNode[],
  s: MagicString,
  offset = 0
) {
  nodes.forEach(({ node, attribute, parent }) => {
    if (attribute.value) {
      const matched = (attribute.matched = s
        .slice(
          attribute.value.start! + offset + 1,
          attribute.value.end! + offset - 1
        )
        .match(
          /^\s?\(?([$A-Z_a-z][\w$]*)\s?,?\s?([$A-Z_a-z][\w$]*)?\)?\s+in\s+(\S+)$/
        ))
      if (!matched) return
      matched[2] ??= `${HELPER_PREFIX}index`
      const [, item, index, list] = matched

      const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)
      s.appendLeft(
        node.start! + offset,
        `${hasScope ? '{' : ''}${list}.map((${item}, ${index}) => `
      )

      s.prependRight(node.end! + offset, `)${hasScope ? '}' : ''}`)
      s.remove(attribute.start! + offset - 1, attribute.end! + offset)
    }
  })
}
