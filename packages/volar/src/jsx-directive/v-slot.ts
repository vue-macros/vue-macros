import { allCodeFeatures, type Code } from '@vue/language-core'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText, isJsxExpression } from '../common'
import { resolveVFor } from './v-for'
import { getTagName, type JsxDirective, type TransformOptions } from './index'

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
): void {
  if (nodeMap.size === 0) return
  const { codes, ts, sfc, source } = options

  nodeMap.forEach(({ attributeMap, vSlotAttribute }, node) => {
    const result: Code[] = [' vSlots={{']
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
          .split(/\s/)[0]
          .replace(/\$(.*)\$/, (_, $1) => {
            isDynamic = true
            return $1
          })
        const isNamespace = attributeName.startsWith(':')
        attributeName = attributeName.slice(1)
        const wrapByQuotes = !attributeName || attributeName.includes('-')
        result.push(
          isNamespace
            ? [
                isDynamic
                  ? `[${attributeName}]`
                  : wrapByQuotes
                    ? `'${attributeName}'`
                    : attributeName,
                source,
                getStart(attribute.name, options) + (wrapByQuotes ? 6 : 7),
                allCodeFeatures,
              ]
            : 'default',
          `: (`,
          (!isNamespace || attributeName) &&
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

        if (vForAttribute) {
          result.push('})),')
        }

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
        getStart(vSlotAttribute, options),
        vSlotAttribute.end + 1,
        ...result,
        // Fix `v-slot:` without type hints
        sfc[source]!.content.slice(vSlotAttribute.end, vSlotAttribute.end + 1),
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
        node.closingElement.pos,
        node.closingElement.pos,
        attributeMap.has(null) ? `</>${slotType}>` : '>',
      )
    }
  })
}

export function transformVSlots(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  const { codes, source } = options

  for (const {
    node,
    attribute: { initializer },
  } of nodes) {
    if (initializer && isJsxExpression(initializer) && initializer.expression) {
      replaceSourceRange(
        codes,
        source,
        initializer.expression.end,
        initializer.expression.end,
        ` satisfies typeof ${ctxMap.get(node)}.slots`,
      )
    }
  }
}
