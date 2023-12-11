import { FileKind, type VueLanguagePlugin } from '@vue/language-core'
import { transformJsxDirective } from './jsx-directive/index'

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-jsx-directive',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (embeddedFile.kind !== FileKind.TypeScriptHostFile) return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!/\sv-(if|for|slot|model|on)/.test(`${sfc[source]?.content}`))
          continue

        transformJsxDirective({
          codes: embeddedFile.content,
          sfc,
          ts,
          source,
          vueVersion: vueCompilerOptions.target,
        })
      }
    },
  }
}
export default plugin
