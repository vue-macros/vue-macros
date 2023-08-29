import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { transformJsxDirective } from './core'
import { generatePluginName } from '#macros' assert { type: 'macro' }

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    exclude: [REGEX_NODE_MODULES],
    ...options,
    version,
  }
}

const name = generatePluginName()

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformJsxDirective(code, id, options.version)
      },
    }
  }
)
