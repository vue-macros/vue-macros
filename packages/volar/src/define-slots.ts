import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import { DEFINE_SLOTS } from '@vue-macros/common'
import {
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replace,
  toString,
} from '@vue/language-core'
import type { VueEmbeddedFile } from '@vue/language-core/out/virtualFile/embeddedFile'

function transform({
  embeddedFile,
  typeArg,
  sfc,
}: {
  embeddedFile: VueEmbeddedFile
  typeArg: import('typescript/lib/tsserverlibrary').TypeNode
  sfc: Sfc
}) {
  if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return
  const textContent = toString(embeddedFile.content)
  if (
    !textContent.includes(DEFINE_SLOTS) ||
    !textContent.includes('return __VLS_slots')
  )
    return

  replace(
    embeddedFile.content,
    /var __VLS_slots!: [\S\s]*?;/,
    'var __VLS_slots!: __VLS_DefineSlots<',
    (): Segment<FileRangeCapabilities> => [
      // slots type
      sfc.scriptSetup!.content.slice(typeArg.pos, typeArg.end),
      'scriptSetup',
      typeArg!.pos,
      FileRangeCapabilities.full,
    ],
    '>;'
  )
  embeddedFile.content.push(
    `type __VLS_DefineSlots<T> = { [SlotName in keyof T]: T[SlotName] extends Function ? T[SlotName] : (_: T[SlotName]) => any }`
  )
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
    name: 'vue-macros-define-slots',
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
