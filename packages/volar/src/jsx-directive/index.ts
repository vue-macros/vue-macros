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
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node,
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
  { ts, sfc, source }: TransformOptions,
) {
  return ts.isJsxSelfClosingElement(node)
    ? node.tagName.getText(sfc[source]?.ast)
    : ts.isJsxElement(node)
      ? node.openingElement.tagName.getText(sfc[source]?.ast)
      : ''
}

function transformCtx(
  node: JsxDirective['node'],
  index: number,
  options: TransformOptions,
) {
  const { ts, sfc, source, codes } = options

  const tag = ts.isJsxSelfClosingElement(node)
    ? node
    : ts.isJsxElement(node)
      ? node.openingElement
      : null
  if (!tag) return ''

  let props = ''
  for (const prop of tag.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue
    const name = prop.name.getText(sfc[source]?.ast)
    if (name.startsWith('v-')) continue

    const value =
      prop.initializer && ts.isJsxExpression(prop.initializer)
        ? prop.initializer.expression?.getText(sfc[source]?.ast)
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
  codes.push(
    `const ${ctxName} = __VLS_getFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}));\n`,
  )
  return ctxName
}
