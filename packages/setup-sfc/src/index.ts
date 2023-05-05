import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_SETUP_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { hotUpdateSetupSFC, transformSetupSFC } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_SETUP_SFC],
    ...options,
    version,
  }
}

const name = 'unplugin-vue-setup-sfc'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformSetupSFC(code, id)
      },

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
  }
)
