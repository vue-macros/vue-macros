import { type UnpluginContextMeta, createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  FilterFileType,
  type MarkRequired,
  createFilter,
  detectVueVersion,
  getFilterPattern,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' assert { type: 'macro' }
import { transformExportProps } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

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

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',
      transformInclude: filter,
      transform: transformExportProps,
    }
  },
)
