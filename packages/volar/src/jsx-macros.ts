import { createFilter } from '@vue-macros/common'
import { getRootMap, globalTypes, transformJsxMacros } from './jsx-macros/index'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'jsxMacros'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)
  const { version: vueVersion } = options

  return {
    name: 'vue-macros-jsx-macros',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || embeddedFile.lang !== 'tsx') return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!sfc[source]) continue
        const options = {
          sfc,
          source,
          ts: ctx.modules.typescript,
          codes: embeddedFile.content,
          vueVersion,
        }
        const rootMap = getRootMap(options, ctx.vueCompilerOptions)
        if (rootMap.size) transformJsxMacros(rootMap, options)

        if (
          (fileName.endsWith('.tsx') || rootMap.size) &&
          !embeddedFile.content.toString().includes(globalTypes)
        ) {
          embeddedFile.content.push(globalTypes)
        }
      }
    },
  }
}
export default plugin
