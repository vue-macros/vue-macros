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
import { shouldTransform, transform, transformVueSFC } from './core'
import { helperCode, helperId } from './core/helper'
import { generatePluginName } from '#macros' assert { type: 'macro' }

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

const name = generatePluginName()

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (id === normalizePath(helperId)) return id
      },

      loadInclude(id) {
        return normalizePath(id) === helperId
      },

      load(id) {
        if (normalizePath(id) === helperId) return helperCode
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
