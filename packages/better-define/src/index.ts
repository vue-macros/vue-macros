import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { RollupResolve, setResolveTSFileIdImpl } from '@vue-macros/api'
import { type PluginContext } from 'rollup'
import { transformBetterDefine } from './core'

export interface Options extends BaseOptions {
  isProduction?: boolean
}

export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'isProduction'
>

function resolveOptions(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()

  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC, REGEX_VUE_SUB],
    isProduction: process.env.NODE_ENV === 'production',
    ...options,
    version,
  }
}

const name = 'unplugin-vue-better-define'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions)
    const filter = createFilter(options)

    const { resolve, handleHotUpdate } = RollupResolve()

    return {
      name,
      enforce: 'pre',

      buildStart() {
        if (framework === 'rollup' || framework === 'vite') {
          setResolveTSFileIdImpl(resolve(this as PluginContext))
        }
      },

      transformInclude(id) {
        return filter(id)
      },

      async transform(code, id) {
        try {
          return await transformBetterDefine(code, id, options.isProduction)
        } catch (err: unknown) {
          this.warn(`${name} ${err}`)
          console.warn(err)
        }
      },

      vite: {
        configResolved(config) {
          options.isProduction = config.isProduction
        },

        handleHotUpdate,
      },
    }
  }
)
