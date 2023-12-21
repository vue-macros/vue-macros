import type { MagicString } from '@vue-macros/common'
import type { JSXAttribute, JSXElement, Node } from '@babel/types'

export type VSlotMap = Map<
  JSXElement,
  {
    vSlotAttribute?: JSXAttribute
    attributeMap: Map<
      JSXAttribute | null,
      {
        children: Node[]
        vIfAttribute?: JSXAttribute
      }
    >
  }
>

export function transformVSlot(
  nodeMap: VSlotMap,
  s: MagicString,
  offset: number,
  version: number,
) {
  Array.from(nodeMap)
    .reverse()
    .forEach(([node, { attributeMap, vSlotAttribute }]) => {
      const result = [` ${version < 3 ? 'scopedSlots' : 'v-slots'}={{`]
      const attributes = Array.from(attributeMap)
      attributes.forEach(([attribute, { children, vIfAttribute }], index) => {
        if (!attribute) return

        if (vIfAttribute) {
          if ('v-if' === vIfAttribute.name.name) {
            result.push('...')
          }
          if (
            ['v-if', 'v-else-if'].includes(`${vIfAttribute.name.name}`) &&
            vIfAttribute.value?.type === 'JSXExpressionContainer'
          ) {
            result.push(
              `(${s.sliceNode(vIfAttribute.value.expression, {
                offset,
              })}) ? {`,
            )
          } else if ('v-else' === vIfAttribute.name.name) {
            result.push('{')
          }
        }

        result.push(
          `'${
            attribute.name.type === 'JSXNamespacedName'
              ? attribute.name.name.name
              : 'default'
          }': (`,
          attribute.value && attribute.value.type === 'JSXExpressionContainer'
            ? s.sliceNode(attribute.value.expression, { offset })
            : '',
          `) => `,
          version < 3 ? '<span>' : '<>',
          children
            .map((child) => {
              const str = s.sliceNode(
                child.type === 'JSXElement' &&
                  s.sliceNode(child.openingElement.name, { offset }) ===
                    'template'
                  ? child.children
                  : child,
                { offset },
              )

              s.removeNode(child, { offset })
              return str
            })
            .join('') || ' ',
          version < 3 ? '</span>,' : '</>,',
        )

        if (vIfAttribute) {
          if (['v-if', 'v-else-if'].includes(`${vIfAttribute.name.name}`)) {
            result.push(
              '}',
              `${attributes[index + 1]?.[1].vIfAttribute?.name
                .name}`.startsWith('v-else')
                ? ` : `
                : ` : null,`,
            )
          } else if ('v-else' === vIfAttribute.name.name) {
            result.push('},')
          }
        }
      })

      if (attributeMap.has(null)) {
        result.push(`default: () => ${version < 3 ? '<span>' : '<>'}`)
      } else {
        result.push('}}')
      }

      if (vSlotAttribute) {
        s.overwriteNode(vSlotAttribute, result.join(''), { offset })
      } else if (node?.type === 'JSXElement') {
        s.overwrite(
          node.openingElement.end! + offset - 1,
          node.openingElement.end! + offset,
          result.join(''),
        )
        s.appendLeft(
          node.closingElement!.start! + offset,
          attributeMap.has(null)
            ? `${version < 3 ? '</span>' : '</>'}}}>`
            : '>',
        )
      }
    })
}
