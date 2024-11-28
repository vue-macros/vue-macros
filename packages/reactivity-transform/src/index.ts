import {
  createFilter,
  createRollupFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  REGEX_NODE_MODULES,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { shouldTransform, transform, transformVueSFC } from './core'
import { helperCode, helperId } from './core/helper'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.SRC_FILE, FilterFileType.VUE_SFC_WITH_SETUP],
    framework,
  )
  return {
    include,
    exclude: [REGEX_NODE_MODULES],
    ...options,
    version,
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)
    const filterSFC = createRollupFilter(
      getFilterPattern(
        [FilterFileType.VUE_SFC_WITH_SETUP, FilterFileType.SETUP_SFC],
        framework,
      ),
    )
    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (id === normalizePath(helperId)) return id
      },

      loadInclude(id) {
        return normalizePath(id) === helperId
      },

      load(id) {
        if (normalizePath(id) === helperId) return helperCode
      },

      transformInclude: filter,
      transform(code, id) {
        if (filterSFC(id)) {
          return transformVueSFC(code, id)
        } else if (shouldTransform(code)) {
          return transform(code, {
            filename: id,
            sourceMap: true,
          })
        }
      },
    }
  },
)
export default plugin
