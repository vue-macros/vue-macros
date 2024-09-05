import { createFilter } from '@vue-macros/common'
import { replaceSourceRange } from 'muggle-string'
import type { VueMacrosPlugin } from './common'
import type { Code, Sfc } from '@vue/language-core'

type RefNode = {
  name: import('typescript').Identifier
  initializer: import('typescript').Expression
}

function transformRef({
  nodes,
  codes,
  ts,
}: {
  nodes: RefNode[]
  codes: Code[]
  ts: typeof import('typescript')
}) {
  const codeString = codes.toString()
  for (const { name, initializer } of nodes) {
    if (
      ts.isCallExpression(initializer) &&
      codeString.includes(`const __VLS_ctx_${name.text} =`)
    ) {
      replaceSourceRange(
        codes,
        'scriptSetup',
        initializer.expression.end,
        initializer.expression.end,
        `<Parameters<NonNullable<typeof __VLS_ctx_${name.text}['expose']>>[0] | null>`,
      )
    }
  }
}

function getRefNodes(
  ts: typeof import('typescript'),
  sfc: Sfc,
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
  const sourceFile = sfc.scriptSetup!.ast
  ts.forEachChild(sourceFile, (node) => {
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
  })

  return result
}

const plugin: VueMacrosPlugin<'jsxRef'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    name: 'vue-macros-jsx-ref',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !sfc.scriptSetup?.ast) return

      const ts = ctx.modules.typescript
      const alias = options.alias || ['useRef']
      const nodes = getRefNodes(ts, sfc, alias)
      if (!nodes.length) return

      transformRef({
        nodes,
        codes: embeddedFile.content,
        ts,
      })
    },
  }
}
export default plugin
