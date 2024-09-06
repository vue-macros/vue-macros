import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  REGEX_SETUP_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformJsxMacros } from './core'
import {
  helperPrefix,
  useExposeHelperCode,
  useExposeHelperId,
  useModelHelperCode,
  useModelHelperId,
} from './core/helper'

export type Options = BaseOptions & {
  lib?: string
}
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const lib = options.lib || 'vue'
  const include = getFilterPattern([FilterFileType.SRC_FILE], framework)
  return {
    include,
    exclude: [REGEX_SETUP_SFC],
    ...options,
    version,
    lib,
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)

    return {
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
      },

      transformInclude: filter,
      transform(code, id) {
        return transformJsxMacros(code, id, options)
      },
    }
  },
)
export default plugin
