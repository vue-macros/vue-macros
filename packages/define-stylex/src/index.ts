import {
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
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
import { transformDefineStyleX } from './core'
import {
  HELPER_PREFIX_REGEX,
  STYLEX_ATTRS_ID_REGEX,
  styleXAttrsCode,
} from './core/helper'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>
export * from './api'

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.VUE_SFC_WITH_SETUP, FilterFileType.SETUP_SFC],
    framework,
  )
  return {
    include,
    ...options,
    version,
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)

    return {
      name,
      enforce: 'pre',
      transform: {
        filter: {
          id: {
            include: options.include as FilterPattern,
            exclude: options.exclude as FilterPattern,
          },
        },
        handler: transformDefineStyleX,
      },

      resolveId: {
        filter: {
          id: HELPER_PREFIX_REGEX,
        },
        handler(id) {
          return id
        },
      },
      load: {
        filter: {
          id: STYLEX_ATTRS_ID_REGEX,
        },
        handler() {
          return styleXAttrsCode
        },
      },
    }
  },
)
export default plugin
