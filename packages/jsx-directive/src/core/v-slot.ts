import type { MagicString } from '@vue-macros/common'
import type { JSXElement } from '@babel/types'

export function transformVSlot(
  nodes: JSXElement[],
  s: MagicString,
  offset: number,
  version: number,
) {
  nodes.reverse().forEach((node) => {
    const attribute = node.openingElement.attributes.find(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        (attribute.name.type === 'JSXNamespacedName'
          ? attribute.name.namespace
          : attribute.name
        ).name === 'v-slot',
    )

    const slots =
      attribute?.type === 'JSXAttribute'
        ? {
            [`${
              attribute.name.type === 'JSXNamespacedName'
                ? attribute.name.name.name
                : 'default'
            }`]: {
              isTemplateTag: false,
              expressionContainer: attribute.value,
              children: node.children,
            },
          }
        : {}
    if (!attribute) {
      for (const child of node.children) {
        let name = 'default'
        let expressionContainer
        const isTemplateTag =
          child.type === 'JSXElement' &&
          child.openingElement.name.type === 'JSXIdentifier' &&
          child.openingElement.name.name === 'template'

        if (child.type === 'JSXElement') {
          for (const attr of child.openingElement.attributes) {
            if (attr.type !== 'JSXAttribute') continue
            if (isTemplateTag) {
              name =
                attr.name.type === 'JSXNamespacedName'
                  ? attr.name.name.name
                  : 'default'
            }

            if (
              (attr.name.type === 'JSXNamespacedName'
                ? attr.name.namespace
                : attr.name
              ).name === 'v-slot'
            )
              expressionContainer = attr.value
          }
        }

        slots[name] ??= {
          isTemplateTag,
          expressionContainer,
          children: [child],
        }
        if (!slots[name].isTemplateTag) {
          slots[name].expressionContainer = expressionContainer
          slots[name].isTemplateTag = isTemplateTag
          if (isTemplateTag) {
            slots[name].children = [child]
          } else {
            slots[name].children.push(child)
          }
        }
      }
    }

    const result = `${
      version < 3 ? 'scopedSlots' : 'v-slots'
    }={{${Object.entries(slots)
      .map(
        ([name, { expressionContainer, children }]) =>
          `'${name}': (${
            expressionContainer?.type === 'JSXExpressionContainer'
              ? s.sliceNode(expressionContainer.expression, { offset })
              : ''
          }) => ${version < 3 ? '<span>' : '<>'}${children
            .map((child) => {
              const result = s.sliceNode(
                child.type === 'JSXElement' &&
                  child.openingElement.name.type === 'JSXIdentifier' &&
                  child.openingElement.name.name === 'template'
                  ? child.children
                  : child,
                { offset },
              )
              s.removeNode(child, { offset })
              return result
            })
            .join('')}${version < 3 ? '</span>' : '</>'}`,
      )
      .join(',')}}}`

    if (attribute) {
      s.overwriteNode(attribute, result, { offset })
    } else {
      s.appendLeft(node.openingElement.end! + offset - 1, ` ${result}`)
    }
  })
}
