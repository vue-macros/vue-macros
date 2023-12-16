import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { getSlotsType } from '../common'
import type { JsxAttributeNode, TransformOptions } from './index'

export function transformVSlot({
  nodes,
  codes,
  ts,
  sfc,
  source,
  vueVersion,
}: TransformOptions & {
  nodes: JsxAttributeNode['node'][]
}) {
  if (nodes.length === 0) return
  getSlotsType(codes, vueVersion)

  nodes.forEach((node) => {
    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName
      : ts.isJsxElement(node)
        ? node.openingElement.tagName
        : null
    const element = ts.isJsxSelfClosingElement(node)
      ? node
      : ts.isJsxElement(node)
        ? node.openingElement
        : null
    if (!tagName || !element) return
    const attribute = element.attributes.properties.find(
      (attribute) =>
        ts.isJsxAttribute(attribute) &&
        (ts.isJsxNamespacedName(attribute.name)
          ? attribute.name.namespace
          : attribute.name
        ).escapedText === 'v-slot',
    ) as import('typescript/lib/tsserverlibrary').JsxAttribute

    const slotMap = new Map(
      attribute
        ? [
            [
              ts.isJsxNamespacedName(attribute.name)
                ? attribute.name.name
                : undefined,
              {
                isTemplateTag: false,
                initializer: attribute.initializer,
                children: ts.isJsxElement(node) ? [...node.children] : [],
              },
            ],
          ]
        : [],
    )

    if (!attribute && ts.isJsxElement(node)) {
      for (const child of node.children) {
        let name
        let initializer
        const childElement = ts.isJsxElement(child)
          ? child.openingElement
          : ts.isJsxSelfClosingElement(child)
            ? child
            : null
        const isTemplateTag =
          !!childElement &&
          childElement.tagName.getText(sfc[source]?.ast) === 'template'

        if (childElement) {
          for (const attr of childElement.attributes.properties) {
            if (!ts.isJsxAttribute(attr)) continue
            if (isTemplateTag) {
              name =
                ts.isJsxNamespacedName(attr.name) &&
                attr.name.name.escapedText !== 'default'
                  ? attr.name.name
                  : undefined
            }
            if (
              (ts.isJsxNamespacedName(attr.name)
                ? attr.name.namespace
                : attr.name
              ).escapedText === 'v-slot'
            ) {
              initializer = attr.initializer
            }
          }
        }

        if (!slotMap.get(name)) {
          slotMap.set(name, {
            isTemplateTag,
            initializer,
            children: [child],
          })
        }
        const slot = slotMap.get(name)!
        if (!slot.isTemplateTag) {
          slot.initializer = initializer
          slot.isTemplateTag = isTemplateTag
          if (isTemplateTag) {
            console.log([child.getText(sfc[source]?.ast)], '...')
            slot.children = [child]
          } else {
            slot.children.push(child)
          }
        }
      }
    }

    const result = [
      ' v-slots={{',
      ...Array.from(slotMap.entries()).flatMap(
        ([name, { initializer, children }]) => [
          name
            ? [
                `'${name.escapedText}'`,
                source,
                name.pos - 1,
                FileRangeCapabilities.full,
              ]
            : 'default',
          `: (`,
          initializer &&
          ts.isJsxExpression(initializer) &&
          initializer.expression
            ? [
                `${sfc[source]!.content.slice(
                  initializer.expression.pos,
                  initializer.expression.end,
                )}`,
                source,
                initializer.expression.pos,
                FileRangeCapabilities.full,
              ]
            : '',
          ') => <>',
          ...children.map((child) => {
            const node =
              ts.isJsxElement(child) &&
              ts.isIdentifier(child.openingElement.tagName) &&
              child.openingElement.tagName.escapedText === 'template'
                ? child.children
                : child
            replaceSourceRange(codes, source, child.pos, child.end)
            return ts.isJsxSelfClosingElement(child)
              ? ''
              : [
                  sfc[source]!.content.slice(node.pos, node.end),
                  source,
                  node.pos,
                  FileRangeCapabilities.full,
                ]
          }),
          '</>,',
        ],
      ),
      `} as __VLS_getSlots<typeof ${tagName.getText(sfc[source]?.ast)}> }`,
    ] as Segment<FileRangeCapabilities>[]

    if (attribute) {
      replaceSourceRange(codes, source, attribute.pos, attribute.end, ...result)
    } else {
      replaceSourceRange(codes, source, tagName.end, tagName.end, ...result)
    }
  })
}
