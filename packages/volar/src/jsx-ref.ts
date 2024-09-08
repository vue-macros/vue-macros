import { createFilter } from '@vue-macros/common'
import { replaceSourceRange } from 'muggle-string'
import type { VueMacrosPlugin } from './common'
import type { Code } from '@vue/language-core'

type RefNode = {
  name: import('typescript').Identifier
  initializer: import('typescript').Expression
}

function transformRef({
  nodes,
  codes,
  ts,
  source,
}: {
  nodes: RefNode[]
  codes: Code[]
  ts: typeof import('typescript')
  source: 'script' | 'scriptSetup'
}) {
  for (const { name, initializer } of nodes) {
    if (ts.isCallExpression(initializer)) {
      replaceSourceRange(
        codes,
        source,
        initializer.expression.end,
        initializer.expression.end,
        `<Parameters<NonNullable<typeof __VLS_ctx_${name.text}['expose']>>[0] | null>`,
      )
    }
  }
}

function getRefNodes(
  ts: typeof import('typescript'),
  sourceFile: import('typescript').SourceFile,
  alias: string[],
) {
  function isRefCall(
    node: import('typescript').Node,
  ): node is import('typescript').CallExpression {
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      !node.typeArguments?.length &&
      alias.includes(node.expression.escapedText!)
    )
  }

  const result: RefNode[] = []
  function walk(node: import('typescript').Node) {
    if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          ts.isCallExpression(decl.initializer) &&
          ts.isIdentifier(decl.initializer.expression)
        ) {
          const initializer =
            decl.initializer.expression.escapedText === '$'
              ? decl.initializer.arguments[0]
              : decl.initializer
          if (isRefCall(initializer))
            result.push({ name: decl.name, initializer })
        }
      })
    }
    ts.forEachChild(node, walk)
  }
  ts.forEachChild(sourceFile, walk)
  return result
}

const plugin: VueMacrosPlugin<'jsxRef'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    name: 'vue-macros-jsx-ref',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName)) return
      const ts = ctx.modules.typescript
      const alias = options.alias || ['useRef']

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!sfc[source]) continue
        const nodes = getRefNodes(ts, sfc[source].ast, alias)
        if (nodes.length) {
          transformRef({
            nodes,
            codes: embeddedFile.content,
            ts,
            source,
          })
        }
      }
    },
  }
}
export default plugin
