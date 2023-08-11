import {
  type JSXAttribute,
  type JSXElement,
  type Node,
  type Program,
} from '@babel/types'
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

export type JsxDirectiveNode = {
  node: JSXElement
  attribute: JSXAttribute & { matched?: RegExpMatchArray | null }
  parent?: Node | null
}

export function transformJsxDirective(code: string, id: string) {
  const lang = getLang(id)
  let asts: {
    ast: Program
    offset: number
  }[] = []
  if (lang === 'vue' || REGEX_SETUP_SFC.test(id)) {
    const { scriptSetup, getSetupAst, script, getScriptAst } = parseSFC(
      code,
      id
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
    if (!/\sv-(if|for|memo|once)/.test(s.sliceNode(ast, { offset }))) continue

    const vIfMap = new Map<Node, JsxDirectiveNode[]>()
    const vForNodes: JsxDirectiveNode[] = []
    const vMemoNodes: (JsxDirectiveNode & {
      vForAttribute?: JSXAttribute
    })[] = []
    walkAST<Node>(ast, {
      enter(node, parent) {
        if (node.type !== 'JSXElement') return

        let vIfAttribute
        let vForAttribute
        let vMemoAttribute
        for (const attribute of node.openingElement.attributes) {
          if (attribute.type !== 'JSXAttribute') continue
          if (
            ['v-if', 'v-else-if', 'v-else'].includes(`${attribute.name.name}`)
          )
            vIfAttribute = attribute
          if (attribute.name.name === 'v-for') vForAttribute = attribute
          if (['v-memo', 'v-once'].includes(`${attribute.name.name}`))
            vMemoAttribute = attribute
        }

        if (vIfAttribute) {
          if (!vIfMap.has(parent!)) vIfMap.set(parent!, [])
          vIfMap.get(parent!)?.push({
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
        if (vMemoAttribute) {
          vMemoNodes.push({
            node,
            attribute: vMemoAttribute,
            parent: vForAttribute || vIfAttribute ? undefined : parent,
            vForAttribute,
          })
        }
      },
    })

    vIfMap.forEach((nodes) => transformVIf(nodes, s, offset))
    transformVFor(vForNodes, s, offset)
    transformVMemo(vMemoNodes, s, offset)
  }

  return generateTransform(s, id)
}
