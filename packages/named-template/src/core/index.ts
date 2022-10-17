import {
  MagicString,
  babelParse,
  getLang,
  getTransformResult,
  isCallOf,
  walkAST,
} from '@vue-macros/common'
import { createTransformContext, parse, traverseNode } from '@vue/compiler-dom'
import { parseVueRequest } from '@vitejs/plugin-vue'
import { QUERY_NAMED_TEMPLATE } from './constants'
import type { CallExpression, Identifier, Node } from '@babel/types'
import type { FileTemplateContext } from '..'
import type {
  AttributeNode,
  ElementNode,
  NodeTransform,
} from '@vue/compiler-dom'

export const transformTemplateIs =
  (s: MagicString): NodeTransform =>
  (node) => {
    if (!(node.type === 1 /* NodeTypes.ELEMENT */ && node.tag === 'template'))
      return

    const propIs = node.props.find(
      (prop): prop is AttributeNode =>
        prop.type === 6 /* NodeTypes.ATTRIBUTE */ && prop.name === 'is'
    )
    if (!propIs?.value) return

    const refName = propIs.value.content
    s.overwrite(
      node.loc.start.offset,
      node.loc.end.offset,
      `<component is="named-template-${refName}" />`
    )
  }

export const transformSubTemplates = (
  code: string,
  id: string,
  fileTemplateContext: FileTemplateContext
) => {
  const root = parse(code)

  const s = new MagicString(code)

  for (const node of root.children) {
    if (node.type !== 1 /* NodeTypes.ELEMENT */ || node.tag !== 'template')
      continue

    const propName = node.props.find(
      (prop): prop is AttributeNode =>
        prop.type === 6 /* NodeTypes.ATTRIBUTE */ && prop.name === 'name'
    )
    if (!propName) {
      transformMainTemplate(node)
      continue
    } else if (!propName.value) {
      continue
    }

    const name = propName.value.content

    let template = ''
    if (node.children.length > 0) {
      const lastChild = node.children[node.children.length - 1]
      template = s.slice(
        node.children[0].loc.start.offset,
        lastChild.loc.end.offset
      )
    }

    if (!fileTemplateContext[id]) fileTemplateContext[id] = {}
    fileTemplateContext[id][name] = template

    s.appendLeft(node.loc.start.offset, `<named-template name="${name}">`)
    s.appendLeft(node.loc.end.offset, '</named-template>')
  }

  return getTransformResult(s, id)

  function transformMainTemplate(node: ElementNode) {
    const ctx = createTransformContext(root, {
      filename: id,
      nodeTransforms: [transformTemplateIs(s)],
    })
    traverseNode(node, ctx)
  }
}

export const transformMainTemplate = (code: string, id: string) => {
  const lang = getLang(id)
  const program = babelParse(code, lang)
  const subTemplates: {
    name: string
    vnode: CallExpression
    component: Node
    fnName: string
  }[] = []
  const customBlocks: Record<string, string> = {}

  const s = new MagicString(code)

  walkAST<Node>(program, {
    enter(node) {
      if (
        isCallOf(node, ['_createVNode', '_createBlock']) &&
        isCallOf(node.arguments[0], '_resolveDynamicComponent') &&
        node.arguments[0].arguments[0].type === 'StringLiteral' &&
        node.arguments[0].arguments[0].value.startsWith('named-template-')
      ) {
        subTemplates.push({
          vnode: node,
          component: node.arguments[0],
          name: node.arguments[0].arguments[0].value.replace(
            'named-template-',
            ''
          ),
          fnName: (node.callee as Identifier).name,
        })
      } else if (
        node.type === 'ImportDeclaration' &&
        node.source.value.includes(QUERY_NAMED_TEMPLATE)
      ) {
        const { name } = parseVueRequest(node.source.value).query as any
        const local = node.specifiers[0].local.name
        customBlocks[name] = local
      }
    },
  })

  if (subTemplates.length === 0) return

  let importFragment = false
  for (const { vnode, component, name, fnName } of subTemplates) {
    const block = customBlocks[name]
    if (!block) continue
    const render = `${block}.render(_ctx, _cache, $props, $setup, $data, $options)`
    if (fnName === '_createVNode') {
      s.overwriteNode(vnode, render)
    } else if (fnName === '_createBlock') {
      s.overwriteNode(component, '_NT_Fragment')
      const text = `${vnode.arguments[1] ? '' : ', null'}, [${render}]`
      s.appendLeft((vnode.arguments[1] || vnode.arguments[0]).end!, text)
      importFragment = true
    }
  }

  if (importFragment) {
    s.prepend(`import { Fragment as _NT_Fragment } from 'vue'\n`)
  }

  return getTransformResult(s, id)
}
