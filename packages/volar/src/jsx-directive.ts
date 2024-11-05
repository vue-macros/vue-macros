import { createFilter } from '@vue-macros/common'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { transformJsxDirective } from './jsx-directive/index'
import type { OptionsResolved } from '@vue-macros/config'

const plugin: PluginReturn<OptionsResolved['jsxDirective'] | undefined> =
  createPlugin(({ options = {}, ts }) => {
    if (!options) return []
    const filter = createFilter(options)

    return {
      name: 'vue-macros-jsx-directive',
      resolveVirtualCode({ ast, codes, fileName, source, languageId }) {
        if (!filter(fileName) || !['jsx', 'tsx'].includes(languageId)) return
        transformJsxDirective({
          codes,
          ast,
          ts,
          source,
        })
      },
    }
  })

export default plugin
