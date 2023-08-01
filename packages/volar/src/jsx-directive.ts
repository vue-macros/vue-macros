import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import {
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'

function transformDefineOptions({
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
  function transformVFor(
    node: import('typescript/lib/tsserverlibrary').Node,
    parent?: import('typescript/lib/tsserverlibrary').Node
  ) {
    const properties = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
      ? node.attributes.properties
      : []
    for (const attribute of properties) {
      if (
        ts.isJsxAttribute(attribute) &&
        ts.isIdentifier(attribute.name) &&
        attribute.name.escapedText === 'v-for' &&
        attribute.initializer &&
        ts.isJsxExpression(attribute.initializer) &&
        attribute.initializer.expression &&
        ts.isBinaryExpression(attribute.initializer.expression)
      ) {
        replaceSourceRange(codes, source, attribute.pos, attribute.end)

        const listText = sfc[source]!.content.slice(
          attribute.initializer.expression.right.pos + 1,
          attribute.initializer.expression.right.end
        )
        const itemText = sfc[source]!.content.slice(
          attribute.initializer.expression.left.pos,
          attribute.initializer.expression.left.end
        )
        const hasScope = !parent
          ? false
          : ts.isJsxElement(parent) || ts.isJsxFragment(parent)
        replaceSourceRange(
          codes,
          source,
          node.pos,
          node.pos,
          `${hasScope ? '{' : ''}`,
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
          `)${hasScope ? '}' : ''}`
        )
      }
    }

    node.forEachChild((child) => {
      transformVFor(child, node)
    })
  }

  const sourceFile = sfc[`${source}Ast`]!
  if (!sourceFile.getFullText().includes(' v-for=')) return
  sourceFile.forEachChild((node) => {
    if (ts.isExpressionStatement(node)) {
      transformVFor(node.expression)
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.forEachChild((decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        if (ts.isArrowFunction(decl.initializer)) {
          return transformVFor(decl.initializer.body)
        }
        transformVFor(decl.initializer)
      })
    } else if (ts.isFunctionDeclaration(node)) {
      node.body?.statements.forEach((statement) => transformVFor(statement))
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
        if (sfc[source])
          transformDefineOptions({
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
