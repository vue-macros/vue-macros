import {
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
  type FilterPattern,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { shouldTransform, transform, transformVueSFC } from './core'
import { HELPER_ID_REGEX, helperCode, helperId } from './core/helper'

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
    const filterSFC = createRollupFilter(
      getFilterPattern(
        [FilterFileType.VUE_SFC_WITH_SETUP, FilterFileType.SETUP_SFC],
        framework,
      ),
    )
    return {
      name,
      enforce: 'pre',

      resolveId: {
        filter: {
          id: {
            include: HELPER_ID_REGEX,
          },
        },
        handler(id) {
          return id
        },
      },

      load: {
        filter: {
          id: {
            include: HELPER_ID_REGEX,
          },
        },
        handler() {
          return helperCode
        },
      },

      transform: {
        filter: {
          id: {
            include: options.include as FilterPattern,
            exclude: options.exclude as FilterPattern,
          },
        },
        handler(code, id) {
          if (filterSFC(id)) {
            return transformVueSFC(code, id)
          } else if (shouldTransform(code)) {
            return transform(code, {
              filename: id,
              sourceMap: true,
            })
          }
        },
      },
    }
  },
)
export default plugin
