import { type MagicString } from '@vue-macros/common'
import { type JSXElement } from '@babel/types'

export function transformVSlot(
  nodes: JSXElement[],
  s: MagicString,
  offset = 0
) {
  nodes.reverse().forEach((node) => {
    if (node.children.length === 0) return

    const attribute = node.openingElement.attributes.find(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        (attribute.name.type === 'JSXNamespacedName'
          ? attribute.name.namespace.name
          : attribute.name.name) === 'v-slot'
    )

    const slots =
      attribute?.type === 'JSXAttribute'
        ? {
            [`${
              attribute.name.type === 'JSXNamespacedName'
                ? attribute.name.name.name
                : 'default'
            }`]: {
              expressionContainer: attribute.value,
              children: node.children,
            },
          }
        : {}
    if (!attribute) {
      for (const child of node.children) {
        let name = 'default'
        let expressionContainer
        if (child.type === 'JSXElement') {
          for (const attr of child.openingElement.attributes) {
            if (attr.type !== 'JSXAttribute') continue
            if (
              child.openingElement.name.type === 'JSXIdentifier' &&
              child.openingElement.name.name === 'template' &&
              attr.name.type === 'JSXNamespacedName'
            ) {
              name = attr.name.name.name
            }

            if (attr.value?.type === 'JSXExpressionContainer') {
              expressionContainer = attr.value
            }
          }
        }

        ;(slots[name] ??= {
          expressionContainer,
          children: [],
        }).children.push(child)
      }
    }

    const result = `v-slots={{${Object.entries(slots)
      .map(([name, { expressionContainer, children }]) => {
        return `
        '${name}': (${
          expressionContainer?.type === 'JSXExpressionContainer'
            ? s.sliceNode(expressionContainer.expression, { offset })
            : ''
        }) => <>${children
          .map((child: any) => {
            const result = s.sliceNode(
              name !== 'default' && child.type === 'JSXElement'
                ? child.children
                : child,
              { offset }
            )
            s.removeNode(child, { offset })
            return result
          })
          .join('')}</>`
      })
      .join(',')}}}`

    if (attribute) {
      s.overwriteNode(attribute, result, { offset })
    } else {
      s.appendLeft(node.openingElement.end! + offset - 1, ` ${result}`)
    }
  })
}
