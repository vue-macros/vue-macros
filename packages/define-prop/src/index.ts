import process from 'node:process'
import { resolveDtsHMR } from '@vue-macros/api'
import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformDefineProp, type Edition } from './core'
import { helperCode, helperId } from './core/helper'

export interface Options extends BaseOptions {
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

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

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
          options.isProduction ??= config.isProduction
        },

        handleHotUpdate: resolveDtsHMR,
      },
    }
  },
)
export default plugin
