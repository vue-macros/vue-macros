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
  const vSlotNodeSet = new Set<
    import('typescript/lib/tsserverlibrary').JsxElement
  >()
  const vModelAttributes: JsxAttributeNode[] = []
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
    let vModelAttribute

    for (const attribute of properties) {
      if (!ts.isJsxAttribute(attribute)) continue
      if (ts.isIdentifier(attribute.name)) {
        if (
          ['v-if', 'v-else-if', 'v-else'].includes(attribute.name.escapedText!)
        )
          vIfAttribute = attribute
        if (attribute.name.escapedText === 'v-for') vForAttribute = attribute
      }
      if (
        (ts.isJsxNamespacedName(attribute.name)
          ? attribute.name.namespace
          : attribute.name
        ).escapedText === 'v-slot' &&
        ts.isJsxElement(node)
      ) {
        vSlotNodeSet.add(
          ts.isIdentifier(node.openingElement.tagName) &&
            node.openingElement.tagName.escapedText === 'template' &&
            parent &&
            ts.isJsxElement(parent)
            ? parent
            : node,
        )
      }
      if (
        /^v-model(_.*)?$/.test(
          (ts.isJsxNamespacedName(attribute.name)
            ? attribute.name.namespace
            : attribute.name
          ).getText(sfc[source]?.ast),
        )
      ) {
        vModelAttribute = attribute
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
    if (vModelAttribute) {
      vModelAttributes.push({
        node,
        attribute: vModelAttribute,
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
  transformVModel({ nodes: vModelAttributes, codes, sfc, ts, source })
  transformVOn({ nodes: vOnAttributes, codes, sfc, ts, source })
}
