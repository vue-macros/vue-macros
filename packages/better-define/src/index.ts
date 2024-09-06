import process from 'node:process'
import { RollupResolve, setResolveTSFileIdImpl } from '@vue-macros/api'
import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformBetterDefine } from './core'
import type { PluginContext } from 'rollup'

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
      async transform(code, id) {
        try {
          return await transformBetterDefine(code, id, options.isProduction)
        } catch (error: unknown) {
          this.warn(`${name} ${error}`)
          console.warn(error)
        }
      },

      vite: {
        configResolved(config) {
          options.isProduction ??= config.isProduction
        },

        handleHotUpdate,
      },
    }
  },
)
export default plugin
