import {
  type UnpluginContextMeta,
  type UnpluginInstance,
  createUnplugin,
} from 'unplugin'
import {
  type BaseOptions,
  FilterFileType,
  type MarkRequired,
  REGEX_NODE_MODULES,
  createFilter,
  detectVueVersion,
  getFilterPattern,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformJsxDirective } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'version'>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.VUE_SFC_WITH_SETUP, FilterFileType.SRC_FILE],
    framework,
  )
  return {
    include,
    exclude: [REGEX_NODE_MODULES],
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
      transform(code, id) {
        return transformJsxDirective(code, id, options.version)
      },
    }
  },
)
export default plugin
