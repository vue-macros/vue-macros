import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { getSlotsType } from '../common'
import type { JsxDirective, TransformOptions } from './index'

export type VSlotMap = Map<
  JsxDirective['node'],
  {
    vSlotAttribute?: JsxDirective['attribute']
    attributeMap: Map<
      JsxDirective['attribute'] | null,
      {
        children: JsxDirective['node'][]
        vIfAttribute?: JsxDirective['attribute']
      }
    >
  }
>

export function transformVSlot({
  nodeMap,
  codes,
  ts,
  sfc,
  source,
  vueVersion,
}: TransformOptions & { nodeMap: VSlotMap }) {
  if (nodeMap.size === 0) return
  getSlotsType(codes, vueVersion)

  nodeMap.forEach(({ attributeMap, vSlotAttribute }, node) => {
    const element = ts.isJsxSelfClosingElement(node)
      ? node
      : ts.isJsxElement(node)
        ? node.openingElement
        : null
    const tagName = element?.tagName
    if (!tagName) return

    const result: Segment<FileRangeCapabilities>[] = [' v-slots={{']
    const attributes = Array.from(attributeMap)
    attributes.forEach(([attribute, { children, vIfAttribute }], index) => {
      if (!attribute) return

      const vIfAttributeName = vIfAttribute?.name.getText(sfc[source]?.ast)
      if (vIfAttribute && vIfAttributeName) {
        if ('v-if' === vIfAttributeName) {
          result.push('...')
        }
        if (
          ['v-if', 'v-else-if'].includes(vIfAttributeName) &&
          vIfAttribute.initializer &&
          ts.isJsxExpression(vIfAttribute.initializer)
        ) {
          result.push(
            `(${vIfAttribute.initializer.expression?.getText(
              sfc[source]?.ast,
            )}) ? {`,
          )
        } else if ('v-else' === vIfAttributeName) {
          result.push('{')
        }
      }

      let attributeName = attribute.name
        ?.getText(sfc[source]?.ast)
        .slice(6)
        .split(' ')[0]
      const isNamespace = attributeName.startsWith(':')
      attributeName = attributeName.slice(1)
      const hasSpecialChart = !/^[A-Z_a-z]\w*$/.test(attributeName)
      result.push(
        ' ',
        isNamespace
          ? [
              hasSpecialChart ? `'${attributeName}'` : attributeName,
              source,
              attribute.getStart(sfc[source]?.ast) + (hasSpecialChart ? 6 : 7),
              FileRangeCapabilities.full,
            ]
          : 'default',
        `: (`,
        attribute.initializer &&
          ts.isJsxExpression(attribute.initializer) &&
          attribute.initializer.expression
          ? ([
              attribute.initializer.expression.getText(sfc[source]?.ast),
              source,
              attribute.initializer.expression.pos,
              FileRangeCapabilities.full,
            ] as Segment<FileRangeCapabilities>)
          : '',
        ') => <>',
        ...children.map((child) => {
          // Remove original children
          replaceSourceRange(codes, source, child.pos, child.end)

          const node =
            ts.isJsxElement(child) &&
            child.openingElement.tagName.getText(sfc[source]?.ast) ===
              'template'
              ? child.children
              : child
          return ts.isJsxSelfClosingElement(child)
            ? ''
            : ([
                sfc[source]!.content.slice(node.pos, node.end),
                source,
                node.pos,
                FileRangeCapabilities.full,
              ] as Segment<FileRangeCapabilities>)
        }),
        '</>,',
      )

      if (vIfAttribute && vIfAttributeName) {
        if (['v-if', 'v-else-if'].includes(vIfAttributeName)) {
          const nextIndex = index + (attributes[index + 1][0] ? 1 : 2)
          result.push(
            '}',
            `${attributes[nextIndex]?.[1].vIfAttribute?.name.getText(
              sfc[source]?.ast,
            )}`.startsWith('v-else')
              ? ' : '
              : ' : null,',
          )
        } else if ('v-else' === vIfAttributeName) {
          result.push('},')
        }
      }
    })

    const slotType = `} satisfies __VLS_getSlots<typeof ${tagName.getText(
      sfc[source]?.ast,
    )}>}`
    if (attributeMap.has(null)) {
      result.push('default: () => <>')
    } else {
      result.push(slotType)
    }

    if (vSlotAttribute) {
      replaceSourceRange(
        codes,
        source,
        vSlotAttribute.pos,
        vSlotAttribute.end,
        ...result,
      )
    } else if (ts.isJsxElement(node)) {
      replaceSourceRange(
        codes,
        source,
        node.openingElement.end - 1,
        node.openingElement.end,
        ...result,
      )
      replaceSourceRange(
        codes,
        source,
        node.closingElement!.pos!,
        node.closingElement!.pos!,
        attributeMap.has(null) ? `</>${slotType}>` : '>',
      )
    }
  })
}
