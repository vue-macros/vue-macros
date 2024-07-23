import { createFilter } from '@rollup/pluginutils'
import { replaceSourceRange } from 'muggle-string'
import type { VolarOptions } from '..'
import { getStart, getVolarOptions } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

function transform(options: {
  fileName: string
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
  volarOptions: NonNullable<VolarOptions['exportRender']>
}) {
  const { fileName, codes, sfc, ts, volarOptions } = options
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude,
  )
  if (!filter(fileName)) return

  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (!ts.isExportAssignment(stmt)) continue

    replaceSourceRange(
      codes,
      'scriptSetup',
      getStart(stmt, options),
      getStart(stmt.expression, options),
      'defineRender(',
    )
    replaceSourceRange(
      codes,
      'scriptSetup',
      stmt.expression.end,
      stmt.expression.end,
      ')',
    )
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
