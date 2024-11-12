import { createFilter } from '@vue-macros/common'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { getRootMap, globalTypes, transformJsxMacros } from './jsx-macros/index'
import type { OptionsResolved } from '@vue-macros/config'

const plugin: PluginReturn<OptionsResolved['jsxMacros'] | undefined> =
  createPlugin(({ ts }, userOptions = {}) => {
    if (!userOptions) return []

    const filter = createFilter(userOptions)
    const lib = userOptions.lib ?? 'vue'
    const macros = {
      defineModel: userOptions.macros?.defineModel ?? ['defineModel'],
      defineExpose: userOptions.macros?.defineExpose ?? ['defineExpose'],
      defineSlots: userOptions.macros?.defineSlots ?? ['defineSlots'],
      defineStyle: userOptions.macros?.defineStyle ?? ['defineStyle'],
    }

    return {
      name: 'vue-macros-jsx-macros',
      resolveVirtualCode(virtualCode) {
        const { filePath, languageId, codes } = virtualCode
        if (!filter(filePath) || !['jsx', 'tsx'].includes(languageId)) return

        const options = {
          ...virtualCode,
          ts,
          lib,
          macros,
        }
        const rootMap = getRootMap(options)
        if (rootMap.size) transformJsxMacros(rootMap, options)

        if (
          (filePath.endsWith('.tsx') || rootMap.size) &&
          !codes.toString().includes(globalTypes)
        ) {
          codes.push(globalTypes)
        }
      },
    }
  })
export default plugin
