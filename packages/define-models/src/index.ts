import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
  normalizePath,
} from '@vue-macros/common'
import { transformDefineModels } from './core'
import {
  emitHelperCode,
  emitHelperId,
  helperPrefix,
  useVmodelHelperCode,
  useVmodelHelperId,
} from './core/helper'
import { generatePluginName } from '#macros' assert { type: 'macro' }

export interface Options extends BaseOptions {
  /**
   * Unified mode, only works for Vue 2
   *
   * Converts `modelValue` to `value`
   */
  unified?: boolean
}

export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'unified'
>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC, REGEX_VUE_SUB],
    unified: true,
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
        if (normalizePath(id).startsWith(helperPrefix)) return id
      },

      loadInclude(id) {
        return normalizePath(id).startsWith(helperPrefix)
      },

      load(_id) {
        const id = normalizePath(_id)
        if (id === emitHelperId) return emitHelperCode
        else if (id === useVmodelHelperId) return useVmodelHelperCode
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformDefineModels(code, id, options.version, options.unified)
      },
    }
  }
)
