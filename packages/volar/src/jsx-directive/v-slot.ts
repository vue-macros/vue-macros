import {
  type Code,
  allCodeFeatures,
  replaceSourceRange,
} from '@vue/language-core'
import { getStart, getText, isJsxExpression } from '../common'
import { resolveVFor } from './v-for'
import { type JsxDirective, type TransformOptions, getTagName } from './index'

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

export function transformVSlot(
  nodeMap: VSlotMap,
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
) {
  if (nodeMap.size === 0) return
  const { codes, ts, sfc, source } = options

  nodeMap.forEach(({ attributeMap, vSlotAttribute }, node) => {
    const result: Code[] = [' v-slots={{']
    const attributes = Array.from(attributeMap)
    attributes.forEach(
      ([attribute, { children, vIfAttribute, vForAttribute }], index) => {
        if (!attribute) return

        let vIfAttributeName
        if (
          vIfAttribute &&
          (vIfAttributeName = getText(vIfAttribute.name, options))
        ) {
          if ('v-if' === vIfAttributeName) {
            result.push('...')
          }
          if (
            ['v-if', 'v-else-if'].includes(vIfAttributeName) &&
            isJsxExpression(vIfAttribute.initializer) &&
            vIfAttribute.initializer.expression
          ) {
            result.push(
              '(',
              [
                getText(vIfAttribute.initializer.expression, options),
                source,
                getStart(vIfAttribute.initializer.expression, options),
                allCodeFeatures,
              ],
              ') ? {',
            )
          } else if ('v-else' === vIfAttributeName) {
            result.push('{')
          }
        }

        if (vForAttribute) {
          result.push('...', ...resolveVFor(vForAttribute, options), '({')
        }

        let isDynamic = false
        let attributeName = getText(attribute.name, options)
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
                getStart(attribute.name, options) + (isDynamic ? 7 : 6),
                allCodeFeatures,
              ]
            : 'default',
          `: (`,
          isJsxExpression(attribute.initializer) &&
            attribute.initializer.expression
            ? ([
                getText(attribute.initializer.expression, options),
                source,
                getStart(attribute.initializer.expression, options),
                allCodeFeatures,
              ] as Code)
            : '',
          isDynamic ? ': any' : '',
          ') => <>',
          ...children.map((child) => {
            replaceSourceRange(codes, source, child.pos, child.end)

            const isSlotTemplate =
              getTagName(child, options) === 'template' && !vSlotAttribute
            const node =
              isSlotTemplate && ts.isJsxElement(child) ? child.children : child
            return isSlotTemplate && ts.isJsxSelfClosingElement(child)
              ? ''
              : ([
                  sfc[source]!.content.slice(node.pos, node.end),
                  source,
                  node.pos,
                  allCodeFeatures,
                ] as Code)
          }),
          '</>,',
        )

        if (vIfAttribute && vIfAttributeName) {
          if (['v-if', 'v-else-if'].includes(vIfAttributeName)) {
            const nextIndex = index + (attributes[index + 1]?.[0] ? 1 : 2)
            const nextAttribute = attributes[nextIndex]?.[1].vIfAttribute
            result.push(
              '}',
              nextAttribute &&
                `${getText(nextAttribute.name, options)}`.startsWith('v-else')
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

    const slotType = `} satisfies typeof ${ctxMap.get(node)}.slots}`
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
