import { type UnpluginContextMeta, createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  FilterFileType,
  type MarkRequired,
  REGEX_NODE_MODULES,
  createFilter,
  createRollupFilter,
  detectVueVersion,
  getFilterPattern,
  normalizePath,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' assert { type: 'macro' }
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

export default createUnplugin<Options | undefined, false>(
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
