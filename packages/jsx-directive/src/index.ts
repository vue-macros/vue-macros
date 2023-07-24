import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_LANG_JSX,
  REGEX_NODE_MODULES,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { transformJsxVueDirective } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_LANG_JSX],
    exclude: [REGEX_NODE_MODULES],
    ...options,
    version,
  }
}

const name = 'unplugin-jsx-vue-directive'

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
        return transformJsxVueDirective(code, id)
      },
    }
  }
)
