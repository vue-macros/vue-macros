import { createFilter } from '@vue-macros/common'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { transformJsxDirective } from './jsx-directive/index'
import type { OptionsResolved } from '@vue-macros/config'

const plugin: PluginReturn<OptionsResolved['jsxDirective'] | undefined> =
  createPlugin(({ ts }, options = {}) => {
    if (!options) return []
    const filter = createFilter(options)

    return {
      name: 'vue-macros-jsx-directive',
      resolveVirtualCode({ filePath, ast, codes, source, languageId }) {
        if (!filter(filePath) || !['jsx', 'tsx'].includes(languageId)) return
        transformJsxDirective({
          codes,
          ast,
          ts,
          source,
          prefix: options.prefix ?? 'v-',
        })
      },
    }
  })

export default plugin
