import { FileKind } from '@volar/language-core'
import { addProps, getVueLibraryName } from './common'
import type {
  Sfc,
  VueEmbeddedFile,
  VueLanguagePlugin,
} from '@volar/vue-language-core'

function transform({
  file,
  sfc,
  ts,
  vueLibName,
}: {
  file: VueEmbeddedFile
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  vueLibName: string
}) {
  const idx = file?.content.indexOf('const __VLS_setup = async () => {\n')

  const props: Record<string, boolean> = {}
  let source = file.content[idx + 1][0]
  let changed = false
  for (const stmt of sfc.scriptSetupAst!.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    const exportModifier = stmt.modifiers?.find(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    )
    if (!exportModifier) continue

    const start = exportModifier.getFullStart()
    const width = exportModifier.getFullWidth()
    const end = exportModifier.getEnd()
    changed = true
    source = `${source.slice(0, start)}${' '.repeat(width)}${source.slice(end)}`

    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue
      props[decl.name.text] = !!decl.initializer
    }
  }

  if (changed) {
    ;(file.content[idx + 1][0] as any) = source
    addProps(
      file.content,
      [
        `__VLS_TypePropsToRuntimeProps<{
    ${Object.entries(props)
      .map(
        ([prop, optional]) => `${prop}${optional ? '?' : ''}: typeof ${prop}`
      )
      .join(',\n')}
  }>`,
      ],
      vueLibName
    )
  }
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-export-props',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetupAst
      )
        return

      const vueLibName = getVueLibraryName(vueCompilerOptions.target)

      transform({
        file: embeddedFile,
        sfc,
        vueLibName,
        ts,
      })
    },
  }
}
export default plugin
