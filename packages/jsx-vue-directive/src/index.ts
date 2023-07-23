import { createUnplugin } from 'unplugin'
import { createFilter, detectVueVersion } from '@vue-macros/common'
import { type BaseOptions, type MarkRequired } from '@vue-macros/common'
import { transformJsxVueDirective } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
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
