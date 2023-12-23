import { type VSlotMap, transformVSlot } from './v-slot'
import { transformVFor } from './v-for'
import { transformVIf } from './v-if'
import { transformVModel } from './v-model'
import { transformVOn, transformVOnWithModifiers } from './v-on'
import { transformVBind } from './v-bind'
import type { FileRangeCapabilities, Segment, Sfc } from '@vue/language-core'

export type JsxDirective = {
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
  function getTagName(node: JsxDirective['node']) {
    return ts.isJsxSelfClosingElement(node)
      ? node.tagName.getText(sfc[source]?.ast)
      : ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(sfc[source]?.ast)
        : null
  }

  const vIfMap = new Map<
    JsxDirective['node'] | null | undefined,
    JsxDirective[]
  >()
  const vForNodes: JsxDirective[] = []
  const vSlotMap: VSlotMap = new Map()
  const vModelMap = new Map<JsxDirective['node'], JsxDirective[]>()
  const vOnNodes: JsxDirective[] = []
  const vOnWithModifiers: JsxDirective[] = []
  const vBindNodes: JsxDirective[] = []

  function walkJsxDirective(
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node,
  ) {
    const tagName = getTagName(node)
    const properties = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
        ? node.attributes.properties
        : []
    let vIfAttribute
    let vForAttribute
    let vSlotAttribute
    for (const attribute of properties) {
      if (!ts.isJsxAttribute(attribute)) continue
      const attributeName = attribute.name.getText(sfc[source]?.ast)

      if (['v-if', 'v-else-if', 'v-else'].includes(attributeName)) {
        vIfAttribute = attribute
      } else if (attributeName === 'v-for') {
        vForAttribute = attribute
      } else if (/^v-slot(?=:\S*|$)/.test(attributeName)) {
        vSlotAttribute = attribute
      } else if (/^v-model(?=[:_]\S*|$)/.test(attributeName)) {
        vModelMap.has(node) || vModelMap.set(node, [])
        vModelMap.get(node)!.push({
          node,
          attribute,
        })
      } else if (attributeName === 'v-on') {
        vOnNodes.push({ node, attribute })
      } else if (/^on[A-Z]\S*[_|-]\S+/.test(attributeName)) {
        vOnWithModifiers.push({ node, attribute })
      } else if (/^(?!v-)\S+[_|-]\S+/.test(attributeName)) {
        vBindNodes.push({ node, attribute })
      }
    }

    if (vIfAttribute && !(vSlotAttribute && tagName === 'template')) {
      vIfMap.has(parent) || vIfMap.set(parent, [])
      vIfMap.get(parent)!.push({
        node,
        attribute: vIfAttribute,
        parent,
      })
    }

    if (vForAttribute) {
      vForNodes.push({
        node,
        attribute: vForAttribute,
        parent: vIfAttribute ? undefined : parent,
      })
    }

    if (vSlotAttribute) {
      const slotNode = tagName === 'template' ? parent : node
      if (!slotNode) return

      const attributeMap =
        vSlotMap.get(slotNode)?.attributeMap ||
        vSlotMap
          .set(slotNode, {
            vSlotAttribute: tagName !== 'template' ? vSlotAttribute : undefined,
            attributeMap: new Map(),
          })
          .get(slotNode)!.attributeMap
      const children =
        attributeMap.get(vSlotAttribute)?.children ||
        attributeMap
          .set(vSlotAttribute, {
            children: [],
            vIfAttribute:
              tagName === 'template' && vIfAttribute ? vIfAttribute : undefined,
          })
          .get(vSlotAttribute)!.children

      if (slotNode === parent && ts.isJsxElement(parent)) {
        children.push(node)

        if (attributeMap.get(null)) return
        for (const child of parent.children) {
          if (
            (ts.isJsxElement(child) && getTagName(child) === 'template') ||
            (ts.isJsxText(child) && !child.getText(sfc[source]?.ast).trim())
          )
            continue
          const defaultNodes =
            attributeMap.get(null)?.children ||
            attributeMap.set(null, { children: [] }).get(null)!.children
          defaultNodes.push(child)
        }
      } else if (ts.isJsxElement(node)) {
        children.push(...node.children)
      }
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
    nodeMap: vSlotMap,
    codes,
    sfc,
    ts,
    source,
    vueVersion,
  })
  transformVFor({ nodes: vForNodes, codes, sfc, ts, source })
  vIfMap.forEach((nodes) => transformVIf({ nodes, codes, sfc, ts, source }))
  vModelMap.forEach((nodes) =>
    transformVModel({ nodes, codes, sfc, ts, source }),
  )
  transformVOn({ nodes: vOnNodes, codes, sfc, ts, source })
  transformVOnWithModifiers({ nodes: vOnWithModifiers, codes, sfc, ts, source })
  transformVBind({ nodes: vBindNodes, codes, sfc, ts, source })
}
