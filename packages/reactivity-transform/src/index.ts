import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
  normalizePath,
} from '@vue-macros/common'
import { shouldTransform, transform } from './core/impl'
import { transformVueSFC } from './core'
import { helperCode, helperId } from './core/helper'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_SRC_FILE, REGEX_VUE_SFC, REGEX_SETUP_SFC, REGEX_VUE_SUB],
    exclude: [REGEX_NODE_MODULES],
    ...options,
    version,
  }
}

const name = 'unplugin-reactivity-transform'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (id === helperId) return id
      },

      loadInclude(id) {
        return id === helperId
      },

      load(_id) {
        const id = normalizePath(_id)
        if (id === helperId) return helperCode
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        if (
          REGEX_VUE_SFC.test(id) ||
          REGEX_SETUP_SFC.test(id) ||
          REGEX_VUE_SUB.test(id)
        ) {
          return transformVueSFC(code, id)
        } else if (shouldTransform(code)) {
          return transform(code, {
            filename: id,
            sourceMap: true,
          })
        }
      },
    }
  }
)
