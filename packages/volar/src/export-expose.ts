import {
  FileKind,
  FileRangeCapabilities,
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replaceAll,
  replaceSourceRange,
} from '@vue/language-core'
import { createFilter } from '@rollup/pluginutils'
import { getVolarOptions } from './common'
import type { VueEmbeddedFile } from '@vue/language-core/out/virtualFile/embeddedFile'
import type { VolarOptions } from '..'

function transform({
  fileName,
  file,
  sfc,
  ts,
  volarOptions,
}: {
  fileName: string
  file: VueEmbeddedFile
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  volarOptions: NonNullable<VolarOptions['exportExpose']>
}) {
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude
  )
  if (!filter(fileName)) return

  const exposed: Record<string, Segment<FileRangeCapabilities>> = Object.create(
    null
  )
  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    const exportModifier = stmt.modifiers?.find(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    )
    if (!exportModifier) continue

    const start = exportModifier.getStart(sfc.scriptSetup?.ast)
    const end = exportModifier.getEnd()
    replaceSourceRange(file.content, 'scriptSetup', start, end)

    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue
      const name = decl.name.text
      const start = decl.name.getStart(sfc.scriptSetup?.ast)

      exposed[name] = [name, 'scriptSetup', start, FileRangeCapabilities.full]
    }
  }

  if (Object.keys(exposed).length === 0) return

  const exposedStrings = Object.entries(exposed).flatMap(([key, value]) => [
    `${key}: `,
    value,
    ',\n',
  ])

  replaceAll(
    file.content,
    /return {\n/g,
    'return {\n...{ ',
    ...exposedStrings,
    ' },\n'
  )
}

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions,
  modules: { typescript: ts },
}) => {
  return {
    name: 'vue-macros-export-expose',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetup.ast
      )
        return

      transform({
        fileName,
        file: embeddedFile,
        sfc,
        ts,
        volarOptions: getVolarOptions(vueCompilerOptions)?.exportExpose || {},
      })
    },
  }
}
export default plugin
