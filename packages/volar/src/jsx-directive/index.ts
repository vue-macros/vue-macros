import { resolveCtxMap, type CtxMap } from './context'
import { transformCustomDirective } from './custom-directive'
import { transformRef } from './ref'
import { transformVBind } from './v-bind'
import { transformVFor } from './v-for'
import { transformVIf } from './v-if'
import { isNativeFormElement, transformVModel } from './v-model'
import { transformOnWithModifiers, transformVOn } from './v-on'
import { transformVSlot, transformVSlots, type VSlotMap } from './v-slot'
import type { Codes } from 'ts-macro'
import type { JsxOpeningElement, JsxSelfClosingElement } from 'typescript'

export type JsxDirective = {
  attribute: import('typescript').JsxAttribute
  node: import('typescript').Node
  parent?: import('typescript').Node
}

export type TransformOptions = {
  codes: Codes
  ast: import('typescript').SourceFile
  ts: typeof import('typescript')
  prefix: string
}

export function transformJsxDirective(options: TransformOptions): void {
  const { ast, ts, prefix, codes } = options

  const resolvedPrefix = prefix.replaceAll('$', String.raw`\$`)
  const slotRegex = new RegExp(`^${resolvedPrefix}slot(?=:|$)`)
  const modelRegex = new RegExp(`^${resolvedPrefix}model(?=[:_]|$)`)
  const bindRegex = new RegExp(`^(?!${resolvedPrefix}|on[A-Z])\\S+_\\S+`)
  const onWithModifiersRegex = /^on[A-Z]\S*_\S+/

  const vIfMap = new Map<
    JsxDirective['node'] | null | undefined,
    JsxDirective[]
  >()
  const vForNodes: JsxDirective[] = []
  const vSlotMap: VSlotMap = new Map()
  const vModelMap = new Map<JsxDirective['node'], JsxDirective[]>()
  const vOnNodes: JsxDirective[] = []
  const onWithModifiers: JsxDirective[] = []
  const vBindNodes: JsxDirective[] = []
  const refNodes: JsxDirective[] = []
  const vSlots: JsxDirective[] = []
  const customDirectives: JsxDirective['attribute'][] = []

  const ctxNodeMap: CtxMap = new Map()

  let hasVForAttribute = false

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
      const attributeName = attribute.name.getText(ast)

      if (
        [`${prefix}if`, `${prefix}else-if`, `${prefix}else`].includes(
          attributeName,
        )
      ) {
        vIfAttribute = attribute
      } else if (attributeName === `${prefix}for`) {
        vForAttribute = attribute
        hasVForAttribute = true
      } else if (slotRegex.test(attributeName)) {
        vSlotAttribute = attribute
      } else if (modelRegex.test(attributeName)) {
        vModelMap.has(node) || vModelMap.set(node, [])
        vModelMap.get(node)!.push({
          node,
          attribute,
        })
        if (!isNativeFormElement(tagName)) {
          ctxNode = node
        }
      } else if (attributeName === `${prefix}on`) {
        vOnNodes.push({ node, attribute })
        ctxNode = node
      } else if (onWithModifiersRegex.test(attributeName)) {
        onWithModifiers.push({ node, attribute })
      } else if (bindRegex.test(attributeName)) {
        vBindNodes.push({ node, attribute })
      } else if (attributeName === 'ref') {
        refNodes.push({ node, attribute })
        ctxNode = node
      } else if (attributeName === `${prefix}slots`) {
        ctxNode = node
        vSlots.push({ node, attribute })
      } else if (
        [`${prefix}html`, `${prefix}memo`, `${prefix}once`].includes(
          attributeName,
        )
      ) {
        codes.replaceRange(attribute.pos, attribute.end)
      } else if (attributeName.startsWith('v-')) {
        customDirectives.push(attribute)
      }
    }

    // Object Expression slots
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isObjectLiteralExpression(node.expression) &&
      parent &&
      ts.isJsxElement(parent) &&
      parent.children.filter((child) =>
        ts.isJsxText(child) ? child.getText(ast).trim() : true,
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

    if (!vSlotAttribute || tagName !== 'template') {
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
            (ts.isJsxText(child) && !child.getText(ast).trim())
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

    node.forEachChild((child) => {
      parents.unshift(node)
      walkJsxDirective(
        child,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined,
        parents,
      )
      parents.shift()
    })
  }
  ast.forEachChild(walkJsxDirective)

  const ctxMap = resolveCtxMap(ctxNodeMap, options)

  transformVSlot(vSlotMap, ctxMap, options)
  transformVFor(vForNodes, options, hasVForAttribute)
  vIfMap.forEach((nodes) => transformVIf(nodes, options))
  transformVModel(vModelMap, ctxMap, options)
  transformVOn(vOnNodes, ctxMap, options)
  transformOnWithModifiers(onWithModifiers, options)
  transformVBind(vBindNodes, options)
  transformRef(refNodes, ctxMap, options)
  transformVSlots(vSlots, ctxMap, options)
  transformCustomDirective(customDirectives, options)
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
  options: TransformOptions,
): string {
  const openingElement = getOpeningElement(node, options)
  if (!openingElement) return ''

  return openingElement.tagName.getText(options.ast)
}
