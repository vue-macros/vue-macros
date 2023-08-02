import {
  HELPER_PREFIX,
  MagicString,
  babelParse,
  generateTransform,
  getLang,
  importHelperFn,
  isCallOf,
  walkAST,
} from '@vue-macros/common'
import {
  type AttributeNode,
  type ElementNode,
  type NodeTransform,
  type NodeTypes,
  type RootNode,
  createTransformContext,
  parse,
  traverseNode,
} from '@vue/compiler-dom'
import {
  type CallExpression,
  type Identifier,
  type Node,
  type Program,
} from '@babel/types'
import { type CustomBlocks, type TemplateContent } from '..'
import { getChildrenLocation, parseVueRequest } from './utils'
import {
  MAIN_TEMPLATE,
  QUERY_NAMED_TEMPLATE,
  QUERY_TEMPLATE_MAIN,
} from './constants'

export * from './constants'
export * from './utils'

export function transformTemplateIs(s: MagicString): NodeTransform {
  return (node) => {
    if (
      !(
        node.type === (1 satisfies NodeTypes.ELEMENT) && node.tag === 'template'
      )
    )
      return

    const propIs = node.props.find(
      (prop): prop is AttributeNode =>
        prop.type === (6 satisfies NodeTypes.ATTRIBUTE) && prop.name === 'is'
    )
    if (!propIs?.value) return

    const refName = propIs.value.content
    s.overwrite(
      node.loc.start.offset,
      node.loc.end.offset,
      `<component is="named-template-${refName}" />`
    )
  }
}

export function preTransform(
  code: string,
  id: string,
  templateContent: TemplateContent
) {
  const root = parse(code)

  const templates = root.children.filter(
    (node): node is ElementNode =>
      node.type === (1 satisfies NodeTypes.ELEMENT) && node.tag === 'template'
  )
  if (templates.length <= 1) return

  const s = new MagicString(code)
  for (const node of templates) {
    const propName = node.props.find(
      (prop): prop is AttributeNode =>
        prop.type === (6 satisfies NodeTypes.ATTRIBUTE) && prop.name === 'name'
    )
    if (!propName) {
      preTransformMainTemplate({ s, root, node, id, templateContent })
      continue
    } else if (!propName.value) {
      continue
    }

    const name = propName.value.content

    let template = ''
    const templateLoc = getChildrenLocation(node)
    if (templateLoc) {
      template = s.slice(...templateLoc)
    }

    if (!templateContent[id]) templateContent[id] = Object.create(null)
    templateContent[id][name] = template

    s.appendLeft(node.loc.start.offset, `<named-template name="${name}">`)
    s.appendLeft(node.loc.end.offset, '</named-template>')
  }

  return generateTransform(s, id)
}

export function preTransformMainTemplate({
  s,
  root,
  node,
  id,
  templateContent,
}: {
  s: MagicString
  root: RootNode
  node: ElementNode
  id: string
  templateContent: TemplateContent
}) {
  const ctx = createTransformContext(root, {
    filename: id,
    nodeTransforms: [transformTemplateIs(s)],
  })
  traverseNode(node, ctx)

  const loc = getChildrenLocation(node)
  if (!loc) return

  if (!templateContent[id]) templateContent[id] = Object.create(null)
  templateContent[id][MAIN_TEMPLATE] = s.slice(...loc)

  s.remove(...loc)
  const offset = node.loc.start.offset + 1 /* < */ + node.tag.length
  s.appendLeft(offset, ` src="${`${id}?vue&${QUERY_TEMPLATE_MAIN}`}"`)
}

export function postTransform(
  code: string,
  id: string,
  customBlocks: CustomBlocks
) {
  const lang = getLang(id)
  const program = babelParse(code, lang)
  const { filename } = parseVueRequest(id)

  if (!id.includes(QUERY_TEMPLATE_MAIN)) {
    postTransformMainEntry(program, filename, customBlocks)
    return
  }

  const s = new MagicString(code)
  const subTemplates: {
    name: string
    vnode: CallExpression
    component: Node
    fnName: string
  }[] = []

  for (const node of program.body) {
    if (
      node.type === 'ExportNamedDeclaration' &&
      node.declaration?.type === 'FunctionDeclaration' &&
      node.declaration.id?.name === 'render'
    ) {
      const params = node.declaration.params
      if (params.length > 0) {
        const lastParams = params[node.declaration.params.length - 1]
        const loc = [params[0].start!, lastParams.end!] as const
        const paramsText = s.slice(...loc)
        s.overwrite(...loc, '...args')
        s.appendLeft(
          node.declaration.body.start! + 1,
          `\n let [${paramsText}] = args`
        )
      }
    }
  }

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
      }
    },
  })

  if (subTemplates.length === 0) return

  for (const { vnode, component, name, fnName } of subTemplates) {
    const block = customBlocks[filename]?.[name]
    if (!block) throw new SyntaxError(`Unknown named template: ${name}`)

    const render = `${HELPER_PREFIX}block_${escapeTemplateName(
      name
    )}.render(...args)`
    if (fnName === '_createVNode') {
      s.overwriteNode(vnode, render)
    } else if (fnName === '_createBlock') {
      s.overwriteNode(component, importHelperFn(s, 0, 'Fragment'))
      const text = `${vnode.arguments[1] ? '' : ', null'}, [${render}]`
      s.appendLeft((vnode.arguments[1] || vnode.arguments[0]).end!, text)
    }
  }

  for (const [name, source] of Object.entries(customBlocks[filename])) {
    s.prepend(
      `import ${HELPER_PREFIX}block_${escapeTemplateName(
        name
      )} from ${JSON.stringify(source)};\n`
    )
  }

  return generateTransform(s, id)
}

export function postTransformMainEntry(
  program: Program,
  id: string,
  customBlocks: CustomBlocks
) {
  for (const node of program.body) {
    if (
      node.type === 'ImportDeclaration' &&
      node.source.value.includes(QUERY_NAMED_TEMPLATE)
    ) {
      const { name } = parseVueRequest(node.source.value).query as any
      if (!customBlocks[id]) customBlocks[id] = Object.create(null)
      customBlocks[id][name] = node.source.value
    }
  }
}

function escapeTemplateName(name: string) {
  return name.replaceAll('-', '$DASH')
}
