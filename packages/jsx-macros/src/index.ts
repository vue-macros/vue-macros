import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
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
      transformInclude: filter,
      transform(code, id) {
        return transformJsxMacros(code, id, options)
      },
    }
  },
)
export default plugin
