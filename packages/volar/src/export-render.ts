import { createFilter } from '@vue-macros/common'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getVolarOptions } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

function transform(options: {
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
}) {
  const { codes, sfc, ts } = options

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

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'exportRender')
  if (!volarOptions) return []

  const filter = createFilter(volarOptions)

  return {
    name: 'vue-macros-export-render',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !sfc.scriptSetup?.ast) return

      transform({
        codes: embeddedFile.content,
        sfc,
        ts: ctx.modules.typescript,
      })
    },
  }
}
export default plugin
