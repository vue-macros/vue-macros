import { getDirectiveArgs } from './common'
import { resolveVFor } from './v-for'
import { getTagName, type JsxDirective, type TransformOptions } from './index'
import type { Code } from 'ts-macro'

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
  const { codes, ts, ast, prefix } = options

  nodeMap.forEach(({ attributeMap, vSlotAttribute }, node) => {
    const result: Code[] = [' v-slots={{']
    const attributes = Array.from(attributeMap)
    attributes.forEach(
      ([attribute, { children, vIfAttribute, vForAttribute }], index) => {
        if (!attribute) return

        let vIfAttributeName
        if (
          vIfAttribute &&
          (vIfAttributeName = vIfAttribute.name.getText(ast))
        ) {
          if (`${prefix}if` === vIfAttributeName) {
            result.push('...')
          }
          if (
            [`${prefix}if`, `${prefix}else-if`].includes(vIfAttributeName) &&
            vIfAttribute.initializer &&
            ts.isJsxExpression(vIfAttribute.initializer) &&
            vIfAttribute.initializer.expression
          ) {
            result.push(
              '(',
              [
                vIfAttribute.initializer.expression.getText(ast),
                vIfAttribute.initializer.expression.getStart(ast),
              ],
              ') ? {',
            )
          } else if (`${prefix}else` === vIfAttributeName) {
            result.push('{')
          }
        }

        if (vForAttribute) {
          result.push('...', ...resolveVFor(vForAttribute, options), '({')
        }

        const { argument, argumentCode, valueCode, isDynamic } =
          getDirectiveArgs(attribute, options)
        const wrapByQuotes = !argument || argument.includes('-')
        result.push(
          isDynamic ? '[' : '',
          argument
            ? [
                wrapByQuotes ? `'${argument}'` : argument,
                attribute.name.getStart(ast) +
                  (wrapByQuotes ? 6 : 7) +
                  (isDynamic ? 1 : 0),
              ]
            : argumentCode || 'default',
          isDynamic ? ']' : '',
          `: (`,
          ...(valueCode
            ? [valueCode, isDynamic ? ': Record<string, any>' : '']
            : []),
          ') => <>',
          ...children.map((child) => {
            codes.replaceRange(child.pos, child.end)

            const isSlotTemplate =
              getTagName(child, options) === 'template' && !vSlotAttribute
            const node =
              isSlotTemplate && ts.isJsxElement(child) ? child.children : child
            return isSlotTemplate && ts.isJsxSelfClosingElement(child)
              ? ''
              : ([ast.text.slice(node.pos, node.end), node.pos] as Code)
          }),
          '</>,',
        )

        if (vForAttribute) {
          result.push('})),')
        }

        if (vIfAttribute && vIfAttributeName) {
          if ([`${prefix}if`, `${prefix}else-if`].includes(vIfAttributeName)) {
            const nextIndex = index + (attributes[index + 1]?.[0] ? 1 : 2)
            const nextAttribute = attributes[nextIndex]?.[1].vIfAttribute
            result.push(
              '}',
              nextAttribute &&
                nextAttribute.name.getText(ast).startsWith(`${prefix}else`)
                ? ' : '
                : ' : null,',
            )
          } else if (`${prefix}else` === vIfAttributeName) {
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
      codes.replaceRange(
        vSlotAttribute.getStart(ast),
        vSlotAttribute.end,
        ...result,
      )
    } else if (ts.isJsxElement(node)) {
      codes.replaceRange(
        node.openingElement.end - 1,
        node.openingElement.end,
        ...result,
      )
      codes.replaceRange(
        node.closingElement.pos,
        node.closingElement.pos,
        attributeMap.has(null) ? `</>${slotType}>` : '>',
      )
    }
  })
}
