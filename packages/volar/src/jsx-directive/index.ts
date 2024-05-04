import { getText, isJsxExpression } from '../common'
import { type VSlotMap, transformVSlot } from './v-slot'
import { transformVFor } from './v-for'
import { transformVIf } from './v-if'
import { transformVModel } from './v-model'
import { transformVOn, transformVOnWithModifiers } from './v-on'
import { transformVBind } from './v-bind'
import type { Code, Sfc } from '@vue/language-core'

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

export function transformJsxDirective(options: TransformOptions) {
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

  const ctxNodeSet = new Set<JsxDirective['node']>()

  function walkJsxDirective(
    node: import('typescript').Node,
    parent?: import('typescript').Node,
  ) {
    const tagName = getTagName(node, options)
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
      const attributeName = getText(attribute.name, options)

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

        ctxNodeSet.add(node)
      } else if (attributeName === 'v-on') {
        vOnNodes.push({ node, attribute })

        ctxNodeSet.add(node)
      } else if (/^on[A-Z]\S*[_|-]\S+/.test(attributeName)) {
        vOnWithModifiers.push({ node, attribute })
      } else if (/^(?!v-)\S+[_|-]\S+/.test(attributeName)) {
        vBindNodes.push({ node, attribute })
      }
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

      ctxNodeSet.add(slotNode)

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

    ts.forEachChild(node, (child) => {
      walkJsxDirective(
        child,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined,
      )
    })
  }
  ts.forEachChild(sfc[source]!.ast, walkJsxDirective)

  const ctxMap = new Map(
    Array.from(ctxNodeSet).map((node, index) => [
      node,
      transformCtx(node, index, options),
    ]),
  )

  transformVSlot(vSlotMap, ctxMap, options)
  transformVFor(vForNodes, options)
  vIfMap.forEach((nodes) => transformVIf(nodes, options))
  vModelMap.forEach((nodes) => transformVModel(nodes, ctxMap, options))
  transformVOn(vOnNodes, ctxMap, options)
  transformVOnWithModifiers(vOnWithModifiers, options)
  transformVBind(vBindNodes, options)
}

export function getTagName(
  node: JsxDirective['node'],
  options: TransformOptions,
) {
  const { ts } = options
  return ts.isJsxSelfClosingElement(node)
    ? getText(node.tagName, options)
    : ts.isJsxElement(node)
      ? getText(node.openingElement.tagName, options)
      : ''
}

function transformCtx(
  node: JsxDirective['node'],
  index: number,
  options: TransformOptions,
) {
  const { ts, codes, sfc } = options

  const tag = ts.isJsxSelfClosingElement(node)
    ? node
    : ts.isJsxElement(node)
      ? node.openingElement
      : null
  if (!tag) return ''

  let props = ''
  for (const prop of tag.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue
    const name = getText(prop.name, options)
    if (name.startsWith('v-')) continue

    const value = isJsxExpression(prop.initializer)
      ? getText(prop.initializer.expression!, options)
      : 'true'
    props += `'${name}': ${value},`
  }

  const tagName = getTagName(node, options)
  const ctxName = `__VLS_ctx${index}`
  if (!codes.toString().includes('function __VLS_getFunctionalComponentCtx')) {
    codes.push(
      `function __VLS_getFunctionalComponentCtx<T, K>(comp: T, compInstance: K): __VLS_PickNotAny<
	'__ctx' extends keyof __VLS_PickNotAny<K, {}> ? K extends { __ctx?: infer Ctx } ? Ctx : never : any
	, T extends (props: infer P, ctx: infer Ctx) => any ? Ctx & { props: P } : any>;
`,
    )
  }

  const code = `const ${ctxName} = __VLS_getFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}));\n`
  if (sfc.scriptSetup?.generic) {
    const index = codes.findIndex((code) =>
      code.includes('__VLS_setup = (async () => {'),
    )
    codes.splice(index + 1, 0, code)
  } else {
    codes.push(code)
  }

  return ctxName
}
