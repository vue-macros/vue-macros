import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import { DEFINE_SLOTS } from '@vue-macros/common'
import { replace, toString } from 'muggle-string'
import type {
  Sfc,
  VueEmbeddedFile,
  VueLanguagePlugin,
} from '@volar/vue-language-core'

const transform = ({
  embeddedFile,
  typeArg,
  sfc,
}: {
  embeddedFile: VueEmbeddedFile
  typeArg: ts.TypeNode
  sfc: Sfc
}) => {
  if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return
  if (!toString(embeddedFile.content).includes(DEFINE_SLOTS)) return

  if (!embeddedFile.content.includes('return __VLS_slots;\n')) return

  replace(
    embeddedFile.content,
    'return __VLS_slots;\n',
    `return __VLS_slots as __VLS_DefineSlots<`,
    () => [
      // slots type
      sfc.scriptSetup!.content.slice(typeArg.pos, typeArg.end),
      'scriptSetup',
      typeArg!.pos,
      FileRangeCapabilities.full,
    ],
    '>;\n'
  )
  embeddedFile.content.push(
    `type __VLS_DefineSlots<T> = { [SlotName in keyof T]: (_: T[SlotName]) => any }`
  )
}

function getTypeArg(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  sfc: Sfc
) {
  function getCallArg(node: ts.Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === DEFINE_SLOTS &&
        node.typeArguments?.length === 1
      )
    )
      return undefined
    return node.typeArguments[0]
  }

  const sourceFile = sfc.scriptSetupAst
  return sourceFile?.forEachChild((node) => {
    if (!ts.isExpressionStatement(node)) return
    return getCallArg(node.expression)
  })
}

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-short-vmodel',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      const typeArg = getTypeArg(ts, sfc)
      if (!typeArg) return
      transform({
        embeddedFile,
        typeArg,
        sfc,
      })
    },
  }
}

export default plugin
