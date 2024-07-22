import {
  createFilter,
  detectVueVersion,
  REGEX_SETUP_SFC_SUB,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
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

      transformInclude: filter,
      transform: transformSetupSFC,

      vite: {
        config() {
          return {
            esbuild: {
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
