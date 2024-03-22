import {
  MagicString,
  REGEX_SETUP_SFC,
  babelParse,
  generateTransform,
  getLang,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import { transformVIf } from './v-if'
import { transformVFor } from './v-for'
import { transformVMemo } from './v-memo'
import { transformVHtml } from './v-html'
import { transformVModel } from './v-model'
import { type VSlotMap, transformVSlot } from './v-slot'
import { transformVOn, transformVOnWithModifiers } from './v-on'
import type { JSXAttribute, JSXElement, Node, Program } from '@babel/types'

export type JsxDirective = {
  node: JSXElement
  attribute: JSXAttribute
  parent?: Node | null
  vForAttribute?: JSXAttribute
  vMemoAttribute?: JSXAttribute
}

export function transformJsxDirective(
  code: string,
  id: string,
  version: number,
) {
  const lang = getLang(id)
  let asts: {
    ast: Program
    offset: number
  }[] = []
  if (lang === 'vue' || REGEX_SETUP_SFC.test(id)) {
    const { scriptSetup, getSetupAst, script, getScriptAst } = parseSFC(
      code,
      id,
    )
    if (script) {
      asts.push({ ast: getScriptAst()!, offset: script.loc.start.offset })
    }
    if (scriptSetup) {
      asts.push({ ast: getSetupAst()!, offset: scriptSetup.loc.start.offset })
    }
  } else if (['jsx', 'tsx'].includes(lang)) {
    asts = [{ ast: babelParse(code, lang), offset: 0 }]
  } else {
    return
  }

  const s = new MagicString(code)
  for (const { ast, offset } of asts) {
    const vIfMap = new Map<Node | null | undefined, JsxDirective[]>()
    const vForNodes: JsxDirective[] = []
    const vMemoNodes: (JsxDirective & {
      vForAttribute?: JSXAttribute
    })[] = []
    const vHtmlNodes: JsxDirective[] = []
    const vSlotMap: VSlotMap = new Map()
    const vOnNodes: JsxDirective[] = []
    const vOnWithModifiers: JsxDirective[] = []
    walkAST<Node>(ast, {
      enter(node, parent) {
        if (node.type !== 'JSXElement') return
        const tagName = s.sliceNode(node.openingElement.name, {
          offset,
        })

        let vIfAttribute
        let vForAttribute
        let vMemoAttribute
        let vSlotAttribute
        for (const attribute of node.openingElement.attributes) {
          if (attribute.type !== 'JSXAttribute') continue

          if (
            ['v-if', 'v-else-if', 'v-else'].includes(`${attribute.name.name}`)
          ) {
            vIfAttribute = attribute
          } else if (attribute.name.name === 'v-for') {
            vForAttribute = attribute
          } else if (['v-memo', 'v-once'].includes(`${attribute.name.name}`)) {
            vMemoAttribute = attribute
          } else if (attribute.name.name === 'v-html') {
            vHtmlNodes.push({
              node,
              attribute,
            })
          } else if (
            (attribute.name.type === 'JSXNamespacedName'
              ? attribute.name.namespace
              : attribute.name
            ).name === 'v-slot'
          ) {
            vSlotAttribute = attribute
          } else if (attribute.name.name === 'v-on') {
            vOnNodes.push({
              node,
              attribute,
            })
          } else if (/^on[A-Z]\S*_\S+/.test(`${attribute.name.name}`)) {
            vOnWithModifiers.push({
              node,
              attribute,
            })
          } else if (
            attribute.name.type === 'JSXNamespacedName' &&
            attribute.name.namespace.name === 'v-model'
          ) {
            transformVModel(attribute, s, offset)
          }
        }

        if (!(vSlotAttribute && tagName === 'template')) {
          if (vIfAttribute) {
            vIfMap.get(parent) || vIfMap.set(parent, [])
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
              vMemoAttribute,
            })
          }
        }

        if (vMemoAttribute) {
          vMemoNodes.push({
            node,
            attribute: vMemoAttribute,
            parent: vForAttribute || vIfAttribute ? undefined : parent,
            vForAttribute,
          })
        }

        if (vSlotAttribute) {
          const slotNode = tagName === 'template' ? parent : node
          if (slotNode?.type !== 'JSXElement') return

          const attributeMap =
            vSlotMap.get(slotNode)?.attributeMap ||
            vSlotMap
              .set(slotNode, {
                vSlotAttribute:
                  tagName !== 'template' ? vSlotAttribute : undefined,
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

          if (slotNode === parent) {
            children.push(node)

            if (attributeMap.get(null)) return
            for (const child of parent.children) {
              if (
                (child.type === 'JSXElement' &&
                  s.sliceNode(child.openingElement.name, { offset }) ===
                    'template') ||
                (child.type === 'JSXText' &&
                  !s.sliceNode(child, { offset }).trim())
              )
                continue
              const defaultNodes =
                attributeMap.get(null)?.children ||
                attributeMap.set(null, { children: [] }).get(null)!.children
              defaultNodes.push(child)
            }
          } else {
            children.push(...node.children)
          }
        }
      },
    })

    vIfMap.forEach((nodes) => transformVIf(nodes, s, offset, version))
    transformVFor(vForNodes, s, offset, version)
    version >= 3.2 && transformVMemo(vMemoNodes, s, offset)
    transformVHtml(vHtmlNodes, s, offset, version)
    transformVOn(vOnNodes, s, offset, version)
    transformVOnWithModifiers(vOnWithModifiers, s, offset, version)
    transformVSlot(vSlotMap, s, offset, version)
  }

  return generateTransform(s, id)
}
