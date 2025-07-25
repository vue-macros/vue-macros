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

        let isDynamic = false
        let attributeName = attribute.name
          .getText(ast)
          .slice(6)
          .split(/\s/)[0]
          .replace(/\$(.*)\$/, (_, $1) => {
            isDynamic = true
            return $1.replaceAll('_', '.')
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
                attribute.name.getStart(ast) + (wrapByQuotes ? 6 : 7),
              ]
            : 'default',
          `: (`,
          ...((!isNamespace || attributeName) &&
          attribute.initializer &&
          ts.isJsxExpression(attribute.initializer) &&
          attribute.initializer.expression
            ? [
                [
                  attribute.initializer.expression.getText(ast),
                  attribute.initializer.expression.getStart(ast),
                ] as Code,
                isDynamic ? ': any' : '',
              ]
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
          result.push('})) as any,')
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

export function transformVSlots(
  nodes: JsxDirective[],
  ctxMap: Map<JsxDirective['node'], string>,
  options: TransformOptions,
): void {
  const { codes, ts } = options

  for (const {
    node,
    attribute: { initializer },
  } of nodes) {
    if (
      initializer &&
      ts.isJsxExpression(initializer) &&
      initializer.expression
    ) {
      codes.replaceRange(
        initializer.expression.end,
        initializer.expression.end,
        ` satisfies typeof ${ctxMap.get(node)}.slots`,
      )
    }
  }
}
