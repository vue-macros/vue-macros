import { FileKind } from '@volar/language-core'
import { DEFINE_SLOTS } from '@vue-macros/common'
import {
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'
import type { VueEmbeddedFile } from '@vue/language-core/out/virtualFile/embeddedFile'

function transform({
  embeddedFile,
  typeArg,
  vueVersion,
}: {
  embeddedFile: VueEmbeddedFile
  typeArg: import('typescript/lib/tsserverlibrary').TypeNode
  vueVersion: number
}) {
  replaceSourceRange(
    embeddedFile.content,
    'scriptSetup',
    typeArg.pos,
    typeArg.pos,
    '__VLS_DefineSlots<'
  )
  replaceSourceRange(
    embeddedFile.content,
    'scriptSetup',
    typeArg.end,
    typeArg.end,
    '>'
  )

  embeddedFile.content.push(
    `type __VLS_DefineSlots<T> = { [SlotName in keyof T]: T[SlotName] extends Function ? T[SlotName] : (_: T[SlotName]) => any };\n`
  )

  if (vueVersion < 3) {
    embeddedFile.content.push(
      `declare function defineSlots<S extends Record<string, any> = Record<string, any>>(): S;\n`
    )
  }
}

function getTypeArg(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  sfc: Sfc
) {
  function getCallArg(node: import('typescript/lib/tsserverlibrary').Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.escapedText === DEFINE_SLOTS &&
        node.typeArguments?.length === 1
      )
    )
      return undefined
    return node.typeArguments[0]
  }

  return sfc.scriptSetupAst?.forEachChild((node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return node.declarationList.forEachChild((decl) => {
        if (ts.isVariableDeclaration(decl) && decl.initializer)
          return getCallArg(decl.initializer)
      })
    }
  })
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-define-slots',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetupAst
      )
        return

      const typeArg = getTypeArg(ts, sfc)
      if (!typeArg) return

      transform({
        embeddedFile,
        typeArg,
        vueVersion: vueCompilerOptions.target,
      })
    },
  }
}

export default plugin
