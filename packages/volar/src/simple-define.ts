import { FileKind, type VueLanguagePlugin } from '@vue/language-core'
import { getImportNames, rewriteImports } from './common'

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  vueCompilerOptions.macros.defineProps.push('simpleProps')

  return {
    name: 'vue-macros-simple-define',
    version: 1,

    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return
      if (!sfc.scriptSetupAst) return

      rewriteImports(embeddedFile, getImportNames(ts, sfc))
    },
  }
}

export default plugin
