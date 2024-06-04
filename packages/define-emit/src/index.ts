import process from 'node:process'
import { type UnpluginContextMeta, createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  FilterFileType,
  type MarkRequired,
  createFilter,
  detectVueVersion,
  getFilterPattern,
} from '@vue-macros/common'
import { RollupResolve, setResolveTSFileIdImpl } from '@vue-macros/api'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformDefineEmit } from './core'
import type { PluginContext } from 'rollup'

export interface Options extends BaseOptions {
  isProduction?: boolean
}

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

      transformInclude: filter,
      transform: transformDefineEmit,

      vite: {
        configResolved(config) {
          options.isProduction = config.isProduction
        },

        handleHotUpdate,
      },
    }
  },
)
