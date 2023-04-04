import { FileKind } from '@volar/language-core'
import { replaceSourceRange } from 'muggle-string'
import {
  type Sfc,
  type VueEmbeddedFile,
  type VueLanguagePlugin,
} from '@volar/vue-language-core'
import { addProps, getVueLibraryName } from './common'

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
  const props: Record<string, boolean> = {}
  let changed = false
  for (const stmt of sfc.scriptSetupAst!.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    const exportModifier = stmt.modifiers?.find(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    )
    if (!exportModifier) continue

    const start = exportModifier.getStart(sfc.scriptSetupAst!)
    const end = exportModifier.getEnd()
    replaceSourceRange(file.content, 'scriptSetup', start, end)
    changed = true

    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue
      props[decl.name.text] = !!decl.initializer
    }
  }

  if (changed) {
    addProps(
      file.content,
      [
        `__VLS_TypePropsToRuntimeProps<{
${Object.entries(props)
  .map(([prop, optional]) => `  ${prop}${optional ? '?' : ''}: typeof ${prop}`)
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
export = plugin
