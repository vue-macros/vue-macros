import type { OptionsResolved } from '..'
import { resolveVFor } from './v-for'
import type { JSXAttribute, JSXElement, Node } from '@babel/types'
import type { MagicStringAST } from '@vue-macros/common'

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

export function isSlotTemplate(
  child: Node,
  { prefix }: OptionsResolved,
): child is JSXElement {
  return (
    child.type === 'JSXElement' &&
    child.openingElement.name.type === 'JSXIdentifier' &&
    child.openingElement.name.name === 'template' &&
    child.openingElement.attributes.some(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        (attribute.name.type === 'JSXNamespacedName'
          ? attribute.name.namespace
          : attribute.name
        ).name === `${prefix}slot`,
    )
  )
}

export function transformVSlot(
  nodeMap: VSlotMap,
  s: MagicStringAST,
  options: OptionsResolved,
): void {
  const { prefix, lib } = options
  Array.from(nodeMap).forEach(([node, { attributeMap, vSlotAttribute }]) => {
    const result: (string | Node)[] = [` v-slots={{`]
    const attributes = Array.from(attributeMap)
    let isStable = lib === 'vue'
    const removeNodes: Node[] = []
    attributes.forEach(
      ([attribute, { children, vIfAttribute, vForAttribute }], index) => {
        if (!attribute) return

        if (vIfAttribute) {
          isStable = false
          if (`${prefix}if` === vIfAttribute.name.name) {
            result.push('...')
          }
          if (
            [`${prefix}if`, `${prefix}else-if`].includes(
              String(vIfAttribute.name.name),
            ) &&
            vIfAttribute.value?.type === 'JSXExpressionContainer'
          ) {
            result.push('(', vIfAttribute.value.expression, ') ? {')
          } else if (`${prefix}else` === vIfAttribute.name.name) {
            result.push('{')
          }
        }

        if (vForAttribute) {
          isStable = false
          result.push(
            '...Object.fromEntries(',
            ...resolveVFor(vForAttribute, s, { ...options, lib: 'vue' }),
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
          isStable = false
          return $1.replaceAll('_', '.')
        })
        result.push(
          isDynamic ? `[${attributeName}]` : `'${attributeName}'`,
          vForAttribute ? ', ' : ': ',
          '(',
          attribute.value && attribute.value.type === 'JSXExpressionContainer'
            ? attribute.value.expression
            : '',
          ') => ',
          '<>',
          ...(children.flatMap((child) => {
            removeNodes.push(child)
            return isSlotTemplate(child, options)
              ? (child.children as Node[])
              : child
          }) || []),
          '</>,',
        )

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

    if (isStable) {
      result.push('$stable: true,')
    }

    if (attributeMap.has(null)) {
      result.push(`default: () => <>`)
    } else {
      result.push('}}')
    }

    if (vSlotAttribute) {
      s.replaceRange(vSlotAttribute.start!, vSlotAttribute.end!, ...result)
    } else if (node?.type === 'JSXElement') {
      s.replaceRange(
        node.openingElement.end! - 1,
        node.openingElement.end!,
        ...result,
      )
      s.appendLeft(
        node.closingElement!.start!,
        attributeMap.has(null) ? `</>}}>` : '>',
      )
    }

    removeNodes.forEach((node) => s.replaceRange(node.start!, node.end!))
  })
}
