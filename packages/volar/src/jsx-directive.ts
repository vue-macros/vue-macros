import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import {
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'

type JsxAttributeNode = {
  attribute: import('typescript/lib/tsserverlibrary').JsxAttribute
  node: import('typescript/lib/tsserverlibrary').Node
  parent?: import('typescript/lib/tsserverlibrary').Node
}

type TransformOptions = {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  source: 'script' | 'scriptSetup'
}

function transformVIf({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  nodes.forEach(({ node, attribute, parent }, index) => {
    if (!ts.isIdentifier(attribute.name)) return

    if (
      ['v-if', 'v-else-if'].includes(attribute.name.escapedText!) &&
      attribute.initializer &&
      ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer.expression
    ) {
      const hasScope = parent && attribute.name.escapedText === 'v-if'
      const expressionText = sfc[source]!.content.slice(
        attribute.initializer.expression.pos,
        attribute.initializer.expression.end
      )
      replaceSourceRange(
        codes,
        source,
        node.pos,
        node.pos,
        `${hasScope ? `{` : ' '}`,
        [
          expressionText,
          source,
          attribute.end - expressionText.length - 1,
          FileRangeCapabilities.full,
        ],
        ' ? '
      )

      const nextAttribute = nodes[index + 1]?.attribute
      const nextNodeHasElse =
        nextAttribute && ts.isIdentifier(nextAttribute.name)
          ? `${nextAttribute.name.escapedText}`.startsWith('v-else')
          : false
      replaceSourceRange(
        codes,
        source,
        node.end,
        node.end,
        nextNodeHasElse ? ' : ' : ` : null${parent ? '}' : ''}`
      )
    } else if (attribute.name.escapedText === 'v-else') {
      replaceSourceRange(codes, source, node.end, node.end, parent ? '}' : '')
    }
    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  })
}

function transformVFor({
  nodes,
  codes,
  ts,
  sfc,
  source,
}: TransformOptions & { nodes: JsxAttributeNode[] }) {
  nodes.forEach(({ attribute, node, parent }) => {
    if (
      !(
        attribute.initializer &&
        ts.isJsxExpression(attribute.initializer) &&
        attribute.initializer.expression &&
        ts.isBinaryExpression(attribute.initializer.expression)
      )
    )
      return

    const listText = sfc[source]!.content.slice(
      attribute.initializer.expression.right.pos + 1,
      attribute.initializer.expression.right.end
    )
    const itemText = sfc[source]!.content.slice(
      attribute.initializer.expression.left.pos,
      attribute.initializer.expression.left.end
    )
    replaceSourceRange(
      codes,
      source,
      node.pos,
      node.pos,
      `${parent ? '{' : ' '}`,
      [
        listText,
        source,
        attribute.end - listText.length - 1,
        FileRangeCapabilities.full,
      ],
      '.map(',
      [itemText, source, attribute.pos + 8, FileRangeCapabilities.full],
      ' => '
    )

    replaceSourceRange(
      codes,
      source,
      node.end - 1,
      node.end,
      `>)${parent ? '}' : ''}`
    )
    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  })
}

function transformJsxDirective({ codes, sfc, ts, source }: TransformOptions) {
  const vIfMap = new Map<any, JsxAttributeNode[]>()
  const vForNodes: JsxAttributeNode[] = []
  function walkJsxDirective(
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node
  ) {
    const properties = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
      ? node.attributes.properties
      : []
    let vIfAttribute
    let vForAttribute
    for (const attribute of properties) {
      if (!ts.isJsxAttribute(attribute) || !ts.isIdentifier(attribute.name))
        continue
      if (['v-if', 'v-else-if', 'v-else'].includes(attribute.name.escapedText!))
        vIfAttribute = attribute
      else if (attribute.name.escapedText === 'v-for') vForAttribute = attribute
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

    node.forEachChild((child) => {
      walkJsxDirective(
        child,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined
      )
    })
  }
  sfc[`${source}Ast`]!.forEachChild(walkJsxDirective)

  transformVFor({ nodes: vForNodes, codes, sfc, ts, source })
  vIfMap.forEach((nodes) => transformVIf({ nodes, codes, sfc, ts, source }))
}

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-jsx-directive',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!/\s(v-if|v-for)=/.test(`${sfc[source]?.content}`)) continue

        transformJsxDirective({
          codes: embeddedFile.content,
          sfc,
          ts,
          source,
        })
      }
    },
  }
}
export default plugin
