import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  REGEX_SETUP_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformJsxMacros } from './core'
import {
  helperPrefix,
  useExposeHelperCode,
  useExposeHelperId,
  useModelHelperCode,
  useModelHelperId,
  withDefaultsCode,
  withDefaultsHelperId,
} from './core/helper'
import { transformStyle } from './core/style'

export type Options = BaseOptions & {
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact'
  defineStyle?: {
    lang?:
      | 'css'
      | 'postcss'
      | 'scss'
      | 'sass'
      | 'less'
      | 'stylus'
      | (string & {})
    scoped?: boolean
  }
}
export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'lib' | 'defineStyle'
> & { importMap: Map<string, string> }

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const lib = options.lib || 'vue'
  const include = getFilterPattern([FilterFileType.SRC_FILE], framework)
  const defineStyle = options.defineStyle || {}
  defineStyle.lang ??= 'css'
  return {
    include,
    exclude: [REGEX_SETUP_SFC],
    ...options,
    importMap: new Map(),
    defineStyle,
    version,
    lib,
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, true> = createUnplugin(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)

    return [
      {
        name,
        enforce: 'pre',

        resolveId(id) {
          if (normalizePath(id).startsWith(helperPrefix)) return id
        },
        loadInclude(id) {
          return normalizePath(id).startsWith(helperPrefix)
        },
        load(_id) {
          const id = normalizePath(_id)
          if (id === useExposeHelperId) return useExposeHelperCode
          else if (id === useModelHelperId) return useModelHelperCode
          else if (id === withDefaultsHelperId) return withDefaultsCode
        },

        transformInclude: filter,
        transform(code, id) {
          if (options.importMap.get(id)) return
          return transformJsxMacros(code, id, options)
        },
      },
      {
        name: 'unplugin-define-style',
        transformInclude: createFilter({
          include: [new RegExp(`^${helperPrefix}/define-style`)],
        }),
        loadInclude(id) {
          return normalizePath(id).startsWith(helperPrefix)
        },
        load(_id) {
          const id = normalizePath(_id)
          if (options.importMap.get(id)) return options.importMap.get(id)
        },
        transform(code: string, id: string) {
          if (options.importMap.get(id))
            return transformStyle(code, id, options)
        },
      },
    ]
  },
)
export default plugin
