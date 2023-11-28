import { type UnpluginContextMeta, createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  FilterFileType,
  type MarkRequired,
  createFilter,
  detectVueVersion,
  getFilterPattern,
  normalizePath,
} from '@vue-macros/common'
import { RollupResolve, setResolveTSFileIdImpl } from '@vue-macros/api'
import { generatePluginName } from '#macros' assert { type: 'macro' }
import { type Edition, transformDefineProp } from './core'
import { helperCode, helperId } from './core/helper'
import type { PluginContext } from 'rollup'

export interface Options extends BaseOptions {
  isProduction?: boolean
  edition?: Edition
}

export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'isProduction' | 'edition'
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
    edition: 'kevinEdition',
    ...options,
    version,
  }
}

const name = generatePluginName()

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
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

      transformInclude: filter,
      transform(code, id) {
        return transformDefineProp(
          code,
          id,
          options.edition,
          options.isProduction,
        )
      },

      vite: {
        configResolved(config) {
          options.isProduction = config.isProduction
        },

        handleHotUpdate,
      },
    }
  },
)
