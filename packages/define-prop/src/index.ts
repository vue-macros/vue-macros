import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
  normalizePath,
} from '@vue-macros/common'
import { RollupResolve, setResolveTSFileIdImpl } from '@vue-macros/api'
import { type PluginContext } from 'rollup'
import { generatePluginName } from '#macros' assert { type: 'macro' }
import { type Edition, transformDefineProp } from './core'
import { helperCode, helperId } from './core/helper'

export interface Options extends BaseOptions {
  isProduction?: boolean
  edition?: Edition
}

export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'isProduction' | 'edition'
>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC, REGEX_VUE_SUB],
    isProduction: process.env.NODE_ENV === 'production',
    edition: 'kevinEdition',
    ...options,
    version,
  }
}

const name = generatePluginName()

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOption(userOptions)
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

      resolveId(id) {
        if (id === normalizePath(helperId)) return id
      },

      loadInclude(id) {
        return normalizePath(id) === helperId
      },

      load(id) {
        if (normalizePath(id) === helperId) return helperCode
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformDefineProp(
          code,
          id,
          options.edition,
          options.isProduction
        )
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
