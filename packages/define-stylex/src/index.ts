import {
  createFilter,
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  normalizePath,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createUnplugin,
  type UnpluginContextMeta,
  type UnpluginInstance,
} from 'unplugin'
import { transformDefineStyleX } from './core'
import { helperPrefix, styleXAttrsCode, styleXAttrsId } from './core/helper'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>
export * from './api'

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
      transformInclude: filter,
      transform: transformDefineStyleX,
      resolveId(id) {
        if (normalizePath(id).startsWith(helperPrefix)) return id
      },
      loadInclude: (id) => normalizePath(id).startsWith(helperPrefix),
      load(_id) {
        const id = normalizePath(_id)
        if (id === styleXAttrsId) return styleXAttrsCode
      },
    }
  },
)
export default plugin
