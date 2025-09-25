import { createFilter, DEFINE_OPTIONS } from '@vue-macros/common'
import { allCodeFeatures, type Code, type Sfc } from '@vue/language-core'
import { replaceAll } from 'muggle-string'
import { REGEX_DEFINE_COMPONENT, type VueMacrosPlugin } from './common'

function transformDefineOptions({
  codes,
  sfc,
  arg,
}: {
  codes: Code[]
  sfc: Sfc
  arg: import('typescript').Node
}) {
  const source = sfc.scriptSetup!.content.slice(arg.pos, arg.end)
  const seg: Code = [source, 'scriptSetup', arg!.pos, allCodeFeatures]
  replaceAll(codes, REGEX_DEFINE_COMPONENT, '...', seg, ',\n')
}

function getArg(ts: typeof import('typescript'), sfc: Sfc) {
  function getCallArg(node: import('typescript').Node) {
    if (
      !ts.isCallExpression(node) ||
      !ts.isIdentifier(node.expression) ||
      node.expression.escapedText !== DEFINE_OPTIONS
    )
      return
    return node.arguments[0]
  }

  const sourceFile = sfc.scriptSetup!.ast
  return ts.forEachChild(sourceFile, (node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        return getCallArg(decl.initializer)
      })
    }
  })
}

const plugin: VueMacrosPlugin<'defineOptions'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    name: 'vue-macros-define-options',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !sfc.scriptSetup?.ast) return

      const arg = getArg(ctx.modules.typescript, sfc)
      if (!arg) return

      transformDefineOptions({
        codes: embeddedFile.content,
        sfc,
        arg,
      })
    },
  }
}
export default plugin
export { plugin as 'module.exports' }
