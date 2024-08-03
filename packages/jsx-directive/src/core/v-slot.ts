import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import { resolveVFor } from './v-for'
import { isVue2 } from '.'
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
        vForAttribute?: JSXAttribute
      }
    >
  }
>

export function transformVSlot(
  nodeMap: VSlotMap,
  s: MagicStringAST,
  version: number,
): void {
  Array.from(nodeMap)
    .reverse()
    .forEach(([node, { attributeMap, vSlotAttribute }]) => {
      const result = [` ${isVue2(version) ? 'scopedSlots' : 'vSlots'}={{`]
      const attributes = Array.from(attributeMap)
      attributes.forEach(
        ([attribute, { children, vIfAttribute, vForAttribute }], index) => {
          if (!attribute) return

          if (vIfAttribute) {
            if ('v-if' === vIfAttribute.name.name) {
              result.push('...')
            }
            if (
              ['v-if', 'v-else-if'].includes(`${vIfAttribute.name.name}`) &&
              vIfAttribute.value?.type === 'JSXExpressionContainer'
            ) {
              result.push(`(${s.sliceNode(vIfAttribute.value.expression)}) ? {`)
            } else if ('v-else' === vIfAttribute.name.name) {
              result.push('{')
            }
          }

          if (vForAttribute) {
            result.push(
              '...Object.fromEntries(',
              resolveVFor(vForAttribute, { s, version }),
              '([',
            )
          }

          let isDynamic = false
          let attributeName =
            attribute.name.type === 'JSXNamespacedName'
              ? attribute.name.name.name
              : 'default'
          attributeName = attributeName.replace(/\$(.*)\$/, (_, $1) => {
            isDynamic = true
            return $1
          })
          result.push(
            isDynamic
              ? `[${importHelperFn(s, 0, 'unref', version ? 'vue' : '@vue-macros/jsx-directive/helpers')}(${attributeName})]`
              : `'${attributeName}'`,
            vForAttribute ? ', ' : ': ',
            '(',
            attribute.value && attribute.value.type === 'JSXExpressionContainer'
              ? s.sliceNode(attribute.value.expression)
              : '',
            ') => ',
            isVue2(version) ? '<span>' : '<>',
            children
              .map((child) => {
                const str = s.sliceNode(
                  child.type === 'JSXElement' &&
                    s.sliceNode(child.openingElement.name) === 'template'
                    ? child.children
                    : child,
                )

                s.removeNode(child)
                return str
              })
              .join('') || ' ',
            isVue2(version) ? '</span>,' : '</>,',
          )

          if (vForAttribute) {
            result.push(']))),')
          }

          if (vIfAttribute) {
            if (['v-if', 'v-else-if'].includes(`${vIfAttribute.name.name}`)) {
              const nextIndex = index + (attributes[index + 1]?.[0] ? 1 : 2)
              result.push(
                '}',
                `${attributes[nextIndex]?.[1].vIfAttribute?.name.name}`.startsWith(
                  'v-else',
                )
                  ? ' : '
                  : ' : null,',
              )
            } else if ('v-else' === vIfAttribute.name.name) {
              result.push('},')
            }
          }
        },
      )

      if (attributeMap.has(null)) {
        result.push(`default: () => ${isVue2(version) ? '<span>' : '<>'}`)
      } else {
        result.push('}}')
      }

      if (vSlotAttribute) {
        s.overwriteNode(vSlotAttribute, result.join(''))
      } else if (node?.type === 'JSXElement') {
        s.overwrite(
          node.openingElement.end! - 1,
          node.openingElement.end!,
          result.join(''),
        )
        s.appendLeft(
          node.closingElement!.start!,
          attributeMap.has(null)
            ? `${isVue2(version) ? '</span>' : '</>'}}}>`
            : '>',
        )
      }
    })
}
