import { EmbeddedFileKind } from '@volar/language-core'
import { DEFINE_SLOTS } from '@vue-macros/common'
import { toString } from 'muggle-string'
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
  if (embeddedFile.kind !== EmbeddedFileKind.TypeScriptHostFile) return
  if (!toString(embeddedFile.content).includes(DEFINE_SLOTS)) return

  const idx = embeddedFile.content.indexOf('return __VLS_slots;\n')
  if (idx === -1) return

  const source = sfc.scriptSetup!.content.slice(typeArg.pos, typeArg.end)
  embeddedFile.content.splice(
    idx,
    1,
    `return __VLS_slots as __VLS_DefineSlots<`,
    [
      source,
      'scriptSetup',
      typeArg!.pos,
      {
        hover: true,
        diagnostic: true,
        references: true,
        definition: true,
      },
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
