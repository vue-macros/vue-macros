import { DEFINE_OPTIONS } from '@vue-macros/common'
import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  allCodeFeatures,
  replaceAll,
} from '@vue/language-core'

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
  replaceAll(codes, /setup\(\) {/g, '...', seg, ',\nsetup() {')
}

function getArg(ts: typeof import('typescript'), sfc: Sfc) {
  function getCallArg(node: import('typescript').Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.escapedText === DEFINE_OPTIONS
      )
    )
      return undefined
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

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-define-options',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!sfc.scriptSetup || !sfc.scriptSetup.ast) return

      const arg = getArg(ts, sfc)
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
