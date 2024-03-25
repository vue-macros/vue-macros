import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { getSlotsType } from '../common'
import { resolveVFor } from './v-for'
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
        vForAttribute?: JsxDirective['attribute']
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
    const result: Segment<FileRangeCapabilities>[] = [' v-slots={{']
    const attributes = Array.from(attributeMap)
    attributes.forEach(
      ([attribute, { children, vIfAttribute, vForAttribute }], index) => {
        if (!attribute) return

        const vIfAttributeName = vIfAttribute?.name.getText(sfc[source]?.ast)
        if (vIfAttribute && vIfAttributeName) {
          if ('v-if' === vIfAttributeName) {
            result.push('...')
          }
          if (
            ['v-if', 'v-else-if'].includes(vIfAttributeName) &&
            vIfAttribute.initializer &&
            ts.isJsxExpression(vIfAttribute.initializer) &&
            vIfAttribute.initializer.expression
          ) {
            result.push(
              '(',
              [
                vIfAttribute.initializer.expression.getText(sfc[source]?.ast),
                source,
                vIfAttribute.initializer.expression.getStart(sfc[source]?.ast),
                FileRangeCapabilities.full,
              ],
              ') ? {',
            )
          } else if ('v-else' === vIfAttributeName) {
            result.push('{')
          }
        }

        if (vForAttribute) {
          result.push(
            '...',
            ...resolveVFor(vForAttribute, { ts, sfc, source }),
            '({',
          )
        }

        let isDynamic = false
        let attributeName = attribute.name
          ?.getText(sfc[source]?.ast)
          .slice(6)
          .split(' ')[0]
          .replace(/\$(.*)\$/, (_, $1) => {
            isDynamic = true
            return $1
          })
        const isNamespace = attributeName.startsWith(':')
        attributeName = attributeName.slice(1)
        result.push(
          isNamespace
            ? [
                isDynamic ? `[${attributeName}]` : `'${attributeName}'`,
                source,
                attribute.name.getStart(sfc[source]?.ast) + (isDynamic ? 7 : 6),
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
                attribute.initializer.expression.getStart(sfc[source]?.ast),
                FileRangeCapabilities.full,
              ] as Segment<FileRangeCapabilities>)
            : '',
          isDynamic ? ': any' : '',
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
            const nextIndex = index + (attributes[index + 1]?.[0] ? 1 : 2)
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

        if (vForAttribute) {
          result.push('})),')
        }
      },
    )

    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName.getText(sfc[source]?.ast)
      : ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(sfc[source]?.ast)
        : null
    const slotType = `} satisfies __VLS_getSlots<typeof ${tagName}>}`
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
