import { DEFINE_OPTIONS } from '@vue-macros/common'
import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import {
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replace,
} from '@volar/vue-language-core'

function transformDefineOptions({
  codes,
  sfc,
  arg,
}: {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  arg: import('typescript/lib/tsserverlibrary').Node
}) {
  const source = sfc.scriptSetup!.content.slice(arg.pos, arg.end)
  const seg: Segment<FileRangeCapabilities> = [
    source,
    'scriptSetup',
    arg!.pos,
    FileRangeCapabilities.full,
  ]
  replace(codes, /setup\(\) {/, '...', seg, ',\nsetup() {')
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

  const sourceFile = sfc.scriptSetupAst!
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
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetupAst
      )
        return

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
export = plugin
