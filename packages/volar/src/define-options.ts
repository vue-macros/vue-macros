import { DEFINE_OPTIONS } from '@vue-macros/common'
import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  replaceAll,
} from '@vue/language-core'
import { enableAllFeatures } from './common'

function transformDefineOptions({
  codes,
  sfc,
  arg,
}: {
  codes: Code[]
  sfc: Sfc
  arg: import('typescript/lib/tsserverlibrary').Node
}) {
  const source = sfc.scriptSetup!.content.slice(arg.pos, arg.end)
  const seg: Code = [source, 'scriptSetup', arg!.pos, enableAllFeatures()]
  replaceAll(codes, /setup\(\) {/g, '...', seg, ',\nsetup() {')
}

function getArg(ts: typeof import('typescript/lib/tsserverlibrary'), sfc: Sfc) {
  function getCallArg(node: import('typescript/lib/tsserverlibrary').Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === DEFINE_OPTIONS
      )
    )
      return undefined
    return node.arguments[0]
  }

  const sourceFile = sfc.scriptSetup!.ast
  return sourceFile.forEachChild((node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return node.declarationList.forEachChild((decl) => {
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
