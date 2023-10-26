import { FileKind } from '@volar/language-core'
import {
  type Sfc,
  type VueLanguagePlugin,
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
  volarOptions: NonNullable<VolarOptions['exportRender']>
}) {
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude
  )
  if (!filter(fileName)) return

  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (!ts.isExportAssignment(stmt)) continue

    const start = stmt.expression.getStart(sfc.scriptSetup?.ast)
    const end = stmt.expression.getEnd()
    replaceSourceRange(
      file.content,
      'scriptSetup',
      stmt.getStart(sfc.scriptSetup?.ast),
      start,
      'defineRender('
    )
    replaceSourceRange(file.content, 'scriptSetup', end, end, ')')
  }
}

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions,
  modules: { typescript: ts },
}) => {
  return {
    name: 'vue-macros-export-render',
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
        volarOptions: getVolarOptions(vueCompilerOptions)?.exportRender || {},
      })
    },
  }
}
export default plugin
