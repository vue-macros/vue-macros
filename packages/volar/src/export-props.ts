import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  replaceSourceRange,
} from '@vue/language-core'
import { createFilter } from '@rollup/pluginutils'
import { addProps, getStart, getVolarOptions } from './common'
import type { VolarOptions } from '..'

function transform(options: {
  fileName: string
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
  vueLibName: string
  volarOptions: NonNullable<VolarOptions['exportProps']>
}) {
  const { codes, sfc, ts, volarOptions, fileName, vueLibName } = options
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude,
  )
  if (!filter(fileName)) return

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

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-export-props',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!sfc.scriptSetup || !sfc.scriptSetup.ast) return

      const vueLibName = vueCompilerOptions.lib

      transform({
        codes: embeddedFile.content,
        sfc,
        vueLibName,
        ts,
        fileName,
        volarOptions: getVolarOptions(vueCompilerOptions)?.exportProps || {},
      })
    },
  }
}
export default plugin
