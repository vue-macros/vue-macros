import { createFilter } from '@vue-macros/common'
import { transformJsxDirective } from './jsx-directive/index'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'jsxDirective'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

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
          ts: ctx.modules.typescript,
          source,
          vueVersion: ctx.vueCompilerOptions.target,
          prefix: options.prefix ?? 'v-',
        })
      }
    },
  }
}
export default plugin
