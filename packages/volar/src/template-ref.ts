import { replaceSourceRange, toString } from 'muggle-string'
import { addCode } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

function transformTemplateRef({
  nodes,
  codes,
  ts,
}: {
  nodes: import('typescript').CallExpression[]
  codes: Code[]
  ts: typeof import('typescript')
}) {
  for (const node of nodes) {
    if (ts.isStringLiteralLike(node.arguments[0])) {
      replaceSourceRange(
        codes,
        'scriptSetup',
        node.expression.end,
        node.expression.end,
        `<Parameters<typeof __VLS_ctx_${node.arguments[0].text}.expose>[0] | null>`,
      )
    }
  }

  for (const [, tagName, props, ref] of toString(codes).matchAll(
    /__VLS_asFunctionalComponent\((.*), new \1\({(.*ref: \("(.*)"\).*)}\)\)/g,
  )) {
    addCode(
      codes,
      `const __VLS_ctx_${ref} = __VLS_pickFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}));\n`,
    )
  }
}

function getTemplateRefNodes(
  ts: typeof import('typescript'),
  sfc: Sfc,
  alias: string[],
) {
  function isTemplateRefCall(
    node: import('typescript').Node,
  ): node is import('typescript').CallExpression {
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      !node.typeArguments?.length &&
      alias.includes(node.expression.escapedText!)
    )
  }

  const result: import('typescript').CallExpression[] = []
  const sourceFile = sfc.scriptSetup!.ast
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          ts.isCallExpression(decl.initializer) &&
          ts.isIdentifier(decl.initializer.expression)
        ) {
          const node =
            decl.initializer.expression.escapedText === '$'
              ? decl.initializer.arguments[0]
              : decl.initializer
          if (isTemplateRefCall(node)) result.push(node)
        }
      })
    }
  })

  return result
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions: { vueMacros },
}) => {
  return {
    name: 'vue-macros-template-ref',
    version: 2,
    resolveEmbeddedCode(_, sfc, embeddedFile) {
      if (!sfc.scriptSetup || !sfc.scriptSetup.ast) return

      const alias = vueMacros?.templateRef?.alias || [
        'templateRef',
        'useTemplateRef',
      ]
      const nodes = getTemplateRefNodes(ts, sfc, alias)
      if (!nodes.length) return

      transformTemplateRef({
        nodes,
        codes: embeddedFile.content,
        ts,
      })
    },
  }
}
export default plugin
