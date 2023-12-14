import {
  FileRangeCapabilities,
  type Segment,
  replaceSourceRange,
} from '@vue/language-core'
import { getSlotsType } from '../common'
import type { TransformOptions } from './index'

export function transformVSlot({
  nodes,
  codes,
  ts,
  sfc,
  source,
  vueVersion,
}: TransformOptions & {
  nodes: import('typescript/lib/tsserverlibrary').JsxElement[]
}) {
  if (nodes.length === 0) return
  getSlotsType(codes, vueVersion)

  nodes.forEach((node) => {
    if (!ts.isIdentifier(node.openingElement.tagName)) return

    const attribute = node.openingElement.attributes.properties.find(
      (attribute) =>
        ts.isJsxAttribute(attribute) &&
        (ts.isJsxNamespacedName(attribute.name)
          ? attribute.name.namespace
          : attribute.name
        ).escapedText === 'v-slot',
    )

    const slotMap = new Map(
      attribute && ts.isJsxAttribute(attribute)
        ? [
            [
              ts.isJsxNamespacedName(attribute.name)
                ? attribute.name.name
                : undefined,
              {
                isTemplateTag: false,
                initializer: attribute.initializer,
                children: [...node.children],
              },
            ],
          ]
        : [],
    )
    if (!attribute) {
      for (const child of node.children) {
        let name
        let initializer
        const isTemplateTag =
          ts.isJsxElement(child) &&
          ts.isIdentifier(child.openingElement.tagName) &&
          child.openingElement.tagName.escapedText === 'template'

        if (ts.isJsxElement(child)) {
          for (const attr of child.openingElement.attributes.properties) {
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
            )
              initializer = attr.initializer
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
        if (slot && !slot?.isTemplateTag) {
          slot.initializer = initializer
          slot.isTemplateTag = isTemplateTag
          if (isTemplateTag) {
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
            return [
              sfc[source]!.content.slice(node.pos, node.end),
              source,
              node.pos,
              FileRangeCapabilities.full,
            ]
          }),
          '</>,',
        ],
      ),
      `} as __VLS_getSlots<typeof ${node.openingElement.tagName.escapedText}> }`,
    ] as Segment<FileRangeCapabilities>[]

    if (attribute) {
      replaceSourceRange(codes, source, attribute.pos, attribute.end, ...result)
    } else {
      replaceSourceRange(
        codes,
        source,
        node.openingElement.end - 1,
        node.openingElement.end - 1,
        ...result,
      )
    }
  })
}
