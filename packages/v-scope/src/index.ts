import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { transformVScope } from './core'

export type Options = BaseOptions

export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC, REGEX_VUE_SUB],
    ...options,
    version,
  }
}

const name = 'unplugin-vue-v-scope'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    function transformInclude(id: string) {
      return filter(id)
    }

    return {
      name,
      enforce: 'post',

      transformInclude,
      transform(code, id) {
        return transformVScope(code, id)
      },

      rollup: {
        transform: {
          order: 'post',
          handler(code, id) {
            if (!transformInclude(id)) return
            return transformVScope(code, id)
          },
        },
      },
    }
  }
)
