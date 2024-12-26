import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { transformJsxMacros } from './core'
import {
  helperPrefix,
  useExposeHelperCode,
  useExposeHelperId,
  useModelHelperCode,
  useModelHelperId,
  withDefaultsCode,
  withDefaultsHelperId,
} from './core/helper'
import { transformStyle } from './core/style'

export type Options = BaseOptions & {
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact'
  defineComponent?: { alias: string[] }
  defineModel?: { alias: string[] }
  defineExpose?: { alias: string[] }
  defineSlots?: { alias: string[] }
  defineStyle?: { alias: string[] }
}
export type OptionsResolved = MarkRequired<
  Options,
  | 'include'
  | 'version'
  | 'lib'
  | 'defineComponent'
  | 'defineModel'
  | 'defineExpose'
  | 'defineSlots'
  | 'defineStyle'
>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const lib = options.lib || 'vue'
  const include = getFilterPattern([FilterFileType.SRC_FILE], framework)
  return {
    include,
    exclude: [REGEX_SETUP_SFC, REGEX_NODE_MODULES],
    ...options,
    version,
    lib,
    defineComponent: {
      alias: options?.defineComponent?.alias ?? ['defineComponent'],
    },
    defineModel: { alias: options?.defineModel?.alias ?? ['defineModel'] },
    defineSlots: { alias: options?.defineSlots?.alias ?? ['defineSlots'] },
    defineExpose: { alias: options?.defineExpose?.alias ?? ['defineExpose'] },
    defineStyle: { alias: options?.defineStyle?.alias ?? ['defineStyle'] },
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, true> = createUnplugin(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)
    const importMap = new Map()

    return [
      {
        name,
        enforce: 'pre',

        resolveId(id) {
          if (normalizePath(id).startsWith(helperPrefix)) return id
        },
        loadInclude(id) {
          return normalizePath(id).startsWith(helperPrefix)
        },
        load(_id) {
          const id = normalizePath(_id)
          if (id === useExposeHelperId) return useExposeHelperCode
          else if (id === useModelHelperId) return useModelHelperCode
          else if (id === withDefaultsHelperId) return withDefaultsCode
        },

        transformInclude(id) {
          if (importMap.get(id)) return
          return filter(id)
        },
        transform(code, id) {
          return transformJsxMacros(code, id, importMap, options)
        },
      },
      {
        name: 'unplugin-define-style',
        loadInclude(id) {
          return normalizePath(id).startsWith(helperPrefix)
        },
        load(_id) {
          const id = normalizePath(_id)
          if (importMap.get(id)) return importMap.get(id)
        },
        transformInclude: (id) => importMap.get(id),
        transform(code: string, id: string) {
          return transformStyle(code, id, options)
        },
      },
    ]
  },
)
export default plugin
