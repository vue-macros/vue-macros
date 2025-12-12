import process from 'node:process'
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
import { transformDefineEmit } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'isProduction'
>

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
    isProduction: process.env.NODE_ENV === 'production',
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
        handler: transformDefineEmit,
      },

      vite: {
        configResolved(config) {
          options.isProduction ??= config.isProduction
        },
      },
    }
  },
)
export default plugin
