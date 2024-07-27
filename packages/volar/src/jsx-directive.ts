import { createFilter } from '@vue-macros/common'
import { getVolarOptions } from './common'
import { transformJsxDirective } from './jsx-directive/index'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions: { vueMacros, target },
}) => {
  const volarOptions = getVolarOptions(vueMacros, 'jsxDirective')
  if (!volarOptions) return []

  const filter = createFilter(volarOptions)

  return {
    name: 'vue-macros-jsx-directive',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !['jsx', 'tsx'].includes(embeddedFile.lang))
        return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!sfc[source]?.ast) continue

        transformJsxDirective({
          codes: embeddedFile.content,
          sfc,
          ts,
          source,
          vueVersion: target,
        })
      }
    },
  }
}
export default plugin
