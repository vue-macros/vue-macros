import { createFilter } from '@vue-macros/common'
import { replaceSourceRange } from 'muggle-string'
import { createPlugin, type Code, type PluginReturn } from 'ts-macro'
import type { OptionsResolved } from '@vue-macros/config'

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
  source: 'script' | 'scriptSetup' | undefined
}) {
  for (const { name, initializer } of nodes) {
    if (ts.isCallExpression(initializer)) {
      replaceSourceRange(
        codes,
        source,
        initializer.expression.end,
        initializer.expression.end,
        `<Parameters<NonNullable<typeof __VLS_ctx_${name.escapedText}['expose']>>[0] | null>`,
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
      ts.forEachChild(node.declarationList, (decl) => {
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

const plugin: PluginReturn<OptionsResolved['jsxRef'] | undefined> =
  createPlugin(
    (
      { ts, vueCompilerOptions },
      options = vueCompilerOptions?.vueMacros?.jsxRef === true
        ? {}
        : (vueCompilerOptions?.vueMacros?.jsxRef ?? {}),
    ) => {
      if (!options) return []
      const filter = createFilter(options)
      const alias = options.alias || ['useRef']

      return {
        name: 'vue-macros-jsx-ref',
        resolveVirtualCode({ filePath, ast, codes, source, languageId }) {
          if (!filter(filePath) || !['jsx', 'tsx'].includes(languageId)) return
          const nodes = getRefNodes(ts, ast, alias)
          if (nodes.length) {
            transformRef({
              nodes,
              codes,
              ts,
              source,
            })
          }
        },
      }
    },
  )

export default plugin
export { plugin as 'module.exports' }
