import { createFilter } from '@vue-macros/common'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { REGEX_JSX } from './common'
import { transformJsxDirective } from './jsx-directive/index'
import type { OptionsResolved } from '@vue-macros/config'

export default createPlugin(({ options = {}, ts }) => {
  if (!options) return []
  const filter = createFilter({
    ...options,
    include: options.include || REGEX_JSX,
  })

  return {
    name: 'vue-macros-jsx-directive',
    resolveVirtualCode({ ast, codes, fileName, source, languageId }) {
      if (!filter(fileName) && !['jsx', 'tsx'].includes(languageId)) return
      transformJsxDirective({
        codes,
        ast,
        ts,
        source,
      })
    },
  }
}) as PluginReturn<OptionsResolved['jsxDirective'] | undefined>
