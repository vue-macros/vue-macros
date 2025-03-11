import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import type { OptionsResolved } from '..'
import { resolveVFor } from './v-for'
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
  options: OptionsResolved,
): void {
  const { prefix, lib } = options
  Array.from(nodeMap)
    .reverse()
    .forEach(([node, { attributeMap, vSlotAttribute }]) => {
      const result = [` vSlots={{`]
      const attributes = Array.from(attributeMap)
      attributes.forEach(
        ([attribute, { children, vIfAttribute, vForAttribute }], index) => {
          if (!attribute) return

          if (vIfAttribute) {
            if (`${prefix}if` === vIfAttribute.name.name) {
              result.push('...')
            }
            if (
              [`${prefix}if`, `${prefix}else-if`].includes(
                String(vIfAttribute.name.name),
              ) &&
              vIfAttribute.value?.type === 'JSXExpressionContainer'
            ) {
              result.push(`(${s.sliceNode(vIfAttribute.value.expression)}) ? {`)
            } else if (`${prefix}else` === vIfAttribute.name.name) {
              result.push('{')
            }
          }

          if (vForAttribute) {
            result.push(
              '...Object.fromEntries(',
              resolveVFor(vForAttribute, s, { ...options, lib: 'vue' }),
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
            return $1.replaceAll('_', '.')
          })
          result.push(
            isDynamic
              ? `[${importHelperFn(
                  s,
                  0,
                  'unref',
                  undefined,
                  lib.startsWith('vue')
                    ? 'vue'
                    : '@vue-macros/jsx-directive/helpers',
                )}(${attributeName})]`
              : `'${attributeName}'`,
            vForAttribute ? ', ' : ': ',
          )

          const slotFn = [
            '(',
            attribute.value && attribute.value.type === 'JSXExpressionContainer'
              ? s.sliceNode(attribute.value.expression)
              : '',
            ') => ',
            '<>',
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
            '</>',
          ].join('')

          result.push(slotFn, ',')

          if (vForAttribute) {
            result.push(']))),')
          }

          if (vIfAttribute) {
            if (
              [`${prefix}if`, `${prefix}else-if`].includes(
                String(vIfAttribute.name.name),
              )
            ) {
              const nextIndex = index + (attributes[index + 1]?.[0] ? 1 : 2)
              result.push(
                '}',
                String(
                  attributes[nextIndex]?.[1].vIfAttribute?.name.name,
                ).startsWith(`${prefix}else`)
                  ? ' : '
                  : ' : null,',
              )
            } else if (`${prefix}else` === vIfAttribute.name.name) {
              result.push('},')
            }
          }
        },
      )

      if (attributeMap.has(null)) {
        result.push(`default: () => <>`)
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
          attributeMap.has(null) ? `</>}}>` : '>',
        )
      }
    })
}
