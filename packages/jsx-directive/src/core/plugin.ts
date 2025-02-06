import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  helperPrefix,
  withDefaultsHelperCode,
  withDefaultsHelperId,
} from './helper'
import { transformJsxDirective } from '.'
import type { UnpluginContextMeta, UnpluginFactory } from 'unplugin'

export type Options = BaseOptions & {
  prefix?: string
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact' | 'solid' | (string & {})
}
export type OptionsResolved = MarkRequired<
  Options,
  'version' | 'prefix' | 'lib'
>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.VUE_SFC, FilterFileType.SRC_FILE],
    framework,
  )
  return {
    include,
    exclude: [REGEX_NODE_MODULES, REGEX_SETUP_SFC],
    ...options,
    prefix: options.prefix ?? 'v-',
    lib: options.lib ?? 'vue',
    version,
  }
}

const name = generatePluginName()

export const plugin: UnpluginFactory<Options | undefined, false> = (
  userOptions = {},
  { framework } = { framework: 'vite' },
) => {
  const options = resolveOptions(userOptions, framework)
  const filter = createFilter(options)

  return {
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
      if (id === withDefaultsHelperId) return withDefaultsHelperCode
    },

    transformInclude: filter,
    transform(code, id) {
      return transformJsxDirective(code, id, options)
    },
  }
}
