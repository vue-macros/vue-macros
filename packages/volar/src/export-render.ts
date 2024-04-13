import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'
import { createFilter } from '@rollup/pluginutils'
import { getVolarOptions } from './common'
import type { VolarOptions } from '..'

function transform({
  fileName,
  codes,
  sfc,
  ts,
  volarOptions,
}: {
  fileName: string
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  volarOptions: NonNullable<VolarOptions['exportRender']>
}) {
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude,
  )
  if (!filter(fileName)) return

  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (!ts.isExportAssignment(stmt)) continue

    const start = stmt.expression.getStart(sfc.scriptSetup?.ast)
    const end = stmt.expression.getEnd()
    replaceSourceRange(
      codes,
      'scriptSetup',
      stmt.getStart(sfc.scriptSetup?.ast),
      start,
      'defineRender(',
    )
    replaceSourceRange(codes, 'scriptSetup', end, end, ')')
  }
}

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions,
  modules: { typescript: ts },
}) => {
  return {
    name: 'vue-macros-export-render',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!sfc.scriptSetup || !sfc.scriptSetup.ast) return

      transform({
        fileName,
        codes: embeddedFile.content,
        sfc,
        ts,
        volarOptions: getVolarOptions(vueCompilerOptions)?.exportRender || {},
      })
    },
  }
}
export default plugin
