import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import {
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'

function transformJsxDirective({
  codes,
  sfc,
  ts,
  source,
}: {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  source: 'script' | 'scriptSetup'
}) {
  function transform(
    node: import('typescript/lib/tsserverlibrary').Node,
    nodes: import('typescript/lib/tsserverlibrary').Node[] = [],
    parent?: import('typescript/lib/tsserverlibrary').Node
  ) {
    const properties = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
      ? node.attributes.properties
      : []
    for (const attribute of properties) {
      if (!ts.isJsxAttribute(attribute)) return

      transformVIf(attribute, node, nodes, parent)
      transformVFor(attribute, node, parent)
    }

    const children: (typeof node)[] = []
    node.forEachChild((child) => {
      children.push(child)
    })
    children.forEach((child) => {
      transform(
        child,
        children,
        ts.isJsxElement(node) || ts.isJsxFragment(node) ? node : undefined
      )
    })
  }

  function transformVFor(
    attribute: import('typescript/lib/tsserverlibrary').JsxAttribute,
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node
  ) {
    if (
      !(
        ts.isIdentifier(attribute.name) &&
        attribute.name.escapedText === 'v-for' &&
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
      '=>'
    )

    replaceSourceRange(
      codes,
      source,
      node.end,
      node.end,
      `)${parent ? '}' : ''}`
    )
    replaceSourceRange(codes, source, attribute.pos, attribute.end)
  }

  function transformVIf(
    attribute: import('typescript/lib/tsserverlibrary').JsxAttribute,
    node: import('typescript/lib/tsserverlibrary').Node,
    nodes: import('typescript/lib/tsserverlibrary').Node[],
    parent?: import('typescript/lib/tsserverlibrary').Node
  ) {
    if (!attribute.name || !ts.isIdentifier(attribute.name)) return

    if (
      ['v-if', 'v-else-if'].includes(`${attribute.name.escapedText}`) &&
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
        '?'
      )

      const nextNode = nodes
        .slice(nodes?.indexOf(node) + 1)
        .find((i) => ts.isJsxElement(i) || ts.isJsxSelfClosingElement(i))
      const nextNodeHasElse =
        nextNode &&
        (ts.isJsxElement(nextNode)
          ? nextNode.openingElement.attributes.properties
          : ts.isJsxSelfClosingElement(nextNode)
          ? nextNode.attributes.properties
          : []
        ).some(
          (i) =>
            ts.isJsxAttribute(i) &&
            ts.isIdentifier(i.name) &&
            `${i.name.escapedText}`.startsWith('v-else')
        )

      replaceSourceRange(
        codes,
        source,
        node.end,
        node.end,
        `${nextNodeHasElse ? ':' : `:''${parent ? '}' : ''}`}`
      )
      replaceSourceRange(codes, source, attribute.pos, attribute.end)
    } else if (attribute.name.escapedText === 'v-else') {
      replaceSourceRange(
        codes,
        source,
        node.end,
        node.end,
        `${parent ? `}` : ''}`
      )
      replaceSourceRange(codes, source, attribute.pos, attribute.end)
    }
  }

  sfc[`${source}Ast`]!.forEachChild((node) => {
    if (ts.isExpressionStatement(node)) {
      transform(node.expression)
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.forEachChild((decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        if (ts.isArrowFunction(decl.initializer)) {
          return transform(decl.initializer.body)
        }
        transform(decl.initializer)
      })
    } else if (ts.isFunctionDeclaration(node)) {
      node.body?.statements.forEach((statement) => transform(statement))
    }
  })
}

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-jsx-directive',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (/\s(v-for|v-if)=/.test(`${sfc[source]?.content}`))
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
