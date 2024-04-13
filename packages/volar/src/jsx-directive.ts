import { transformJsxDirective } from './jsx-directive/index'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-jsx-directive',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!['jsx', 'tsx'].includes(embeddedFile.lang)) return

      for (const source of ['script', 'scriptSetup'] as const) {
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
