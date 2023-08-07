import { type MagicString } from '@vue-macros/common'
import { type JsxDirectiveNode } from '.'

export function transformVFor(
  nodes: JsxDirectiveNode[],
  s: MagicString,
  offset = 0
) {
  nodes.forEach(({ node, attribute, parent }) => {
    if (attribute.value) {
      const [i, list] = s
        .slice(
          attribute.value.start! + offset + 1,
          attribute.value.end! + offset - 1
        )
        .split(/\s+in\s+/)

      const hasScope = ['JSXElement', 'JSXFragment'].includes(`${parent?.type}`)
      s.appendLeft(
        node.start! + offset,
        `${hasScope ? '{' : ''}${list}.map(${i} => `
      )

      s.overwrite(
        node.end! + offset - 1,
        node.end! + offset,
        `>)${hasScope ? '}' : ''}`
      )
      s.remove(attribute.start! + offset - 1, attribute.end! + offset)
    }
  })
}
