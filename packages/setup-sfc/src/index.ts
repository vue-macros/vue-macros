import {
  createFilter,
  detectVueVersion,
  REGEX_SETUP_SFC_SUB,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createUnplugin,
  type FilterPattern,
  type UnpluginInstance,
} from 'unplugin'
import { hotUpdateSetupSFC, transformSetupSFC } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_SETUP_SFC_SUB],
    exclude: [/vitest\.setup\.\w+$/],
    ...options,
    version,
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}) => {
    const options = resolveOptions(userOptions)
    const filter = createFilter(options)

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
        handler: transformSetupSFC,
      },

      vite: {
        config() {
          // Vite 8 is powered by Rolldown, so `oxc` should be used instead of `esbuild`
          const isRolldownPowered = 'rolldownVersion' in this.meta

          return {
            [isRolldownPowered ? 'oxc' : 'esbuild']: {
              exclude: options.include as any,
              include: options.exclude as any,
            },
          }
        },

        handleHotUpdate: (ctx) => {
          if (filter(ctx.file)) {
            return hotUpdateSetupSFC(ctx, filter)
          }
        },
      },
    }
  },
)
export default plugin
