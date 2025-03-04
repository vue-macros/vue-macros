import { createFilter } from '@vue-macros/common'
import { replaceSourceRange } from 'muggle-string'
import { addProps, getStart, type VueMacrosPlugin } from './common'
import type { Code, Sfc } from '@vue/language-core'

function transform(options: {
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
  vueLibName: string
}) {
  const { codes, sfc, ts, vueLibName } = options

  const props: Record<string, boolean> = Object.create(null)
  let changed = false
  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    const exportModifier = stmt.modifiers?.find(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    )
    if (!exportModifier) continue

    replaceSourceRange(
      codes,
      'scriptSetup',
      getStart(exportModifier, options),
      exportModifier.end,
    )
    changed = true

    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue
      props[decl.name.escapedText!] = !!decl.initializer
    }
  }

  if (changed) {
    addProps(
      codes,
      Object.entries(props).map(
        ([prop, optional]) => `${prop}${optional ? '?' : ''}: typeof ${prop}`,
      ),
      vueLibName,
    )
  }
}

const plugin: VueMacrosPlugin<'exportProps'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    name: 'vue-macros-export-props',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !sfc.scriptSetup?.ast) return

      transform({
        codes: embeddedFile.content,
        sfc,
        vueLibName: ctx.vueCompilerOptions.lib,
        ts: ctx.modules.typescript,
      })
    },
  }
}
export default plugin
export { plugin as 'module.exports' }
