import { getText, isJsxExpression } from '../common'
import { transformCtx } from './context'
import { transformRef } from './ref'
import { transformVBind } from './v-bind'
import { transformVFor } from './v-for'
import { transformVIf } from './v-if'
import { transformVModel } from './v-model'
import { transformVOn, transformVOnWithModifiers } from './v-on'
import { transformVSlot, transformVSlots, type VSlotMap } from './v-slot'
import type { Code, Sfc } from '@vue/language-core'
import type { JsxOpeningElement, JsxSelfClosingElement } from 'typescript'

export type JsxDirective = {
  attribute: import('typescript').JsxAttribute
  node: import('typescript').Node
  parent?: import('typescript').Node
}

export type TransformOptions = {
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
  source: 'script' | 'scriptSetup'
  vueVersion?: number
}

export function transformJsxDirective(options: TransformOptions): void {
  const { sfc, ts, source } = options

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
  const refNodes: JsxDirective[] = []
  const vSlots: JsxDirective[] = []

  const ctxNodeMap = new Map<
    JsxDirective['node'],
    import('typescript').Block | undefined
  >()

  function walkJsxDirective(
    node: import('typescript').Node,
    parent?: import('typescript').Node,
    parents: import('typescript').Node[] = [],
  ) {
    const tagName = getTagName(node, options)
    const properties = getOpeningElement(node, options)
    let ctxNode
    let vIfAttribute
    let vForAttribute
    let vSlotAttribute
    for (const attribute of properties?.attributes.properties || []) {
      if (!ts.isJsxAttribute(attribute)) continue
      const attributeName = getText(attribute.name, options)

      if (['v-if', 'v-else-if', 'v-else'].includes(attributeName)) {
        vIfAttribute = attribute
      } else if (attributeName === 'v-for') {
        vForAttribute = attribute
      } else if (/^v-slot(?=:|$)/.test(attributeName)) {
        vSlotAttribute = attribute
      } else if (/^v-model(?=[:_]|$)/.test(attributeName)) {
        vModelMap.has(node) || vModelMap.set(node, [])
        vModelMap.get(node)!.push({
          node,
          attribute,
        })
        ctxNode = node
      } else if (attributeName === 'v-on') {
        vOnNodes.push({ node, attribute })
        ctxNode = node
      } else if (/^on[A-Z]\S*_\S+/.test(attributeName)) {
        vOnWithModifiers.push({ node, attribute })
      } else if (/^(?!v-|on[A-Z])\S+_\S+/.test(attributeName)) {
        vBindNodes.push({ node, attribute })
      } else if (attributeName === 'ref') {
        refNodes.push({ node, attribute })
        ctxNode = node
      } else if (attributeName === 'v-slots') {
        ctxNode = node
        vSlots.push({ node, attribute })
      }
    }

    // Object Expression slots
    if (
      isJsxExpression(node) &&
      node.expression &&
      ts.isObjectLiteralExpression(node.expression) &&
      parent &&
      ts.isJsxElement(parent) &&
      parent.children.filter((child) =>
        ts.isJsxText(child) ? getText(child, options).trim() : true,
      ).length === 1
    ) {
      ctxNode = node

      vSlots.push({
        node: parent,
        attribute: {
          initializer: {
            kind: ts.SyntaxKind.JsxExpression,
            expression: node.expression,
          },
        },
      } as any)
    }

    if (!(vSlotAttribute && tagName === 'template')) {
      if (vIfAttribute) {
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
    }

    if (vSlotAttribute) {
      const slotNode = tagName === 'template' ? parent : node
      if (!slotNode) return

      ctxNode = slotNode

      const attributeMap =
        vSlotMap.get(slotNode)?.attributeMap ||
        vSlotMap
          .set(slotNode, {
            vSlotAttribute: tagName === 'template' ? undefined : vSlotAttribute,
            attributeMap: new Map(),
          })
          .get(slotNode)!.attributeMap
      const children =
        attributeMap.get(vSlotAttribute)?.children ||
        attributeMap
          .set(vSlotAttribute, {
            children: [],
            ...(tagName === 'template'
              ? {
                  vIfAttribute,
                  vForAttribute,
                }
              : {}),
          })
          .get(vSlotAttribute)!.children

      if (slotNode === parent && ts.isJsxElement(parent)) {
        children.push(node)

        if (attributeMap.get(null)) return
        for (const child of parent.children) {
          if (
            getTagName(child, options) === 'template' ||
            (ts.isJsxText(child) && !getText(child, options).trim())
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

    if (ctxNode) {
      ctxNodeMap.set(ctxNode, parents.find(ts.isBlock))
    }

    ts.forEachChild(node, (child) => {
      parents.unshift(node)
      walkJsxDirective(
        child,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined,
        parents,
      )
      parents.shift()
    })
  }
  ts.forEachChild(sfc[source]!.ast, walkJsxDirective)

  const ctxMap = new Map(
    Array.from(ctxNodeMap).map(([node, root], index) => [
      node,
      transformCtx(node, root, index, options),
    ]),
  )

  transformVSlot(vSlotMap, ctxMap, options)
  transformVFor(vForNodes, options)
  vIfMap.forEach((nodes) => transformVIf(nodes, options))
  vModelMap.forEach((nodes) => transformVModel(nodes, ctxMap, options))
  transformVOn(vOnNodes, ctxMap, options)
  transformVOnWithModifiers(vOnWithModifiers, options)
  transformVBind(vBindNodes, options)
  transformRef(refNodes, ctxMap, options)
  transformVSlots(vSlots, ctxMap, options)
}

export function getOpeningElement(
  node: JsxDirective['node'],
  options: TransformOptions,
): JsxSelfClosingElement | JsxOpeningElement | undefined {
  const { ts } = options

  return ts.isJsxSelfClosingElement(node)
    ? node
    : ts.isJsxElement(node)
      ? node.openingElement
      : undefined
}

export function getTagName(
  node: JsxDirective['node'],
  options: TransformOptions & { withTypes?: boolean },
): string {
  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return ''

  let types = ''
  if (options.withTypes && openingElement.typeArguments?.length) {
    types = `<${openingElement.typeArguments
      .map((argument) => getText(argument, options))
      .join(', ')}>`
  }

  return getText(openingElement.tagName, options) + types
}
