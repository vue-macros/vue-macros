import { transformVSlot } from './v-slot'
import { transformVFor } from './v-for'
import { transformVIf } from './v-if'
import { transformVModel } from './v-model'
import { transformVOn } from './v-on'
import type { FileRangeCapabilities, Segment, Sfc } from '@vue/language-core'

export type JsxAttributeNode = {
  attribute: import('typescript/lib/tsserverlibrary').JsxAttribute
  node: import('typescript/lib/tsserverlibrary').Node
  parent?: import('typescript/lib/tsserverlibrary').Node
}

export type TransformOptions = {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  source: 'script' | 'scriptSetup'
  vueVersion?: number
}

export function transformJsxDirective({
  codes,
  sfc,
  ts,
  source,
  vueVersion,
}: TransformOptions) {
  const vIfAttributeMap = new Map<any, JsxAttributeNode[]>()
  const vForAttributes: JsxAttributeNode[] = []
  const vSlotNodeSet = new Set<JsxAttributeNode['node']>()
  const vModelAttributeMap = new Map<any, JsxAttributeNode[]>()
  const vOnAttributes: JsxAttributeNode[] = []

  function walkJsxDirective(
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node,
  ) {
    const properties = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
        ? node.attributes.properties
        : []
    let vIfAttribute
    let vForAttribute

    for (const attribute of properties) {
      if (!ts.isJsxAttribute(attribute)) continue
      if (ts.isIdentifier(attribute.name)) {
        if (
          ['v-if', 'v-else-if', 'v-else'].includes(attribute.name.escapedText!)
        )
          vIfAttribute = attribute
        if (attribute.name.escapedText === 'v-for') vForAttribute = attribute
      }
      if (/^v-slot[:_]?/.test(attribute.name.getText(sfc[source]?.ast))) {
        const tagName = ts.isJsxSelfClosingElement(node)
          ? node.tagName.getText(sfc[source]?.ast)
          : ts.isJsxElement(node)
            ? node.openingElement.tagName.getText(sfc[source]?.ast)
            : null
        vSlotNodeSet.add(tagName === 'template' && parent ? parent : node)
      }
      if (
        ts.isJsxNamespacedName(attribute.name)
          ? attribute.name.namespace.getText(sfc[source]?.ast) === 'v-model'
          : /^v-model(_\S+)?$/.test(attribute.name.getText(sfc[source]?.ast))
      ) {
        vModelAttributeMap.has(node) || vModelAttributeMap.set(node, [])
        vModelAttributeMap.get(node)!.push({
          node,
          attribute,
        })
      }
      if (attribute.name.getText(sfc[source]?.ast) === 'v-on') {
        vOnAttributes.push({ node, attribute })
      }
    }

    if (vIfAttribute) {
      if (!vIfAttributeMap.has(parent!)) vIfAttributeMap.set(parent!, [])
      vIfAttributeMap.get(parent!)?.push({
        node,
        attribute: vIfAttribute,
        parent,
      })
    }
    if (vForAttribute) {
      vForAttributes.push({
        node,
        attribute: vForAttribute,
        parent: vIfAttribute ? undefined : parent,
      })
    }

    node.forEachChild((child) => {
      walkJsxDirective(
        child,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined,
      )
    })
  }
  sfc[source]?.ast.forEachChild(walkJsxDirective)

  transformVSlot({
    nodes: Array.from(vSlotNodeSet),
    codes,
    sfc,
    ts,
    source,
    vueVersion,
  })
  transformVFor({ nodes: vForAttributes, codes, sfc, ts, source })
  vIfAttributeMap.forEach((nodes) =>
    transformVIf({ nodes, codes, sfc, ts, source }),
  )
  vModelAttributeMap.forEach((nodes) =>
    transformVModel({ nodes, codes, sfc, ts, source }),
  )
  transformVOn({ nodes: vOnAttributes, codes, sfc, ts, source })
}
