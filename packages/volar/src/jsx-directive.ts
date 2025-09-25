import { createFilter } from '@vue-macros/common'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { transformJsxDirective } from './jsx-directive/index'
import type { OptionsResolved } from '@vue-macros/config'

const plugin: PluginReturn<OptionsResolved['jsxDirective'] | undefined> =
  createPlugin(
    (
      { ts, vueCompilerOptions },
      options = vueCompilerOptions?.vueMacros?.jsxDirective === true
        ? {}
        : (vueCompilerOptions?.vueMacros?.jsxDirective ?? {}),
    ) => {
      if (!options) return []
      const filter = createFilter(options)

      return {
        name: 'vue-macros-jsx-directive',
        resolveVirtualCode({ filePath, ast, codes, lang }) {
          if (!filter(filePath) || !['jsx', 'tsx'].includes(lang)) return
          transformJsxDirective({
            codes,
            ast,
            ts,
            prefix: options.prefix ?? 'v-',
          })
        },
      }
    },
  )

export default plugin
export { plugin as 'module.exports' }
