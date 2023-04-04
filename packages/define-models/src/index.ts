import { createUnplugin } from 'unplugin'
import {
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
  normalizePath,
} from '@vue-macros/common'
import { type BaseOptions, type MarkRequired } from '@vue-macros/common'
import { type UnpluginContextMeta } from 'unplugin'
import { transformDefineModels } from './core'
import {
  emitHelperCode,
  emitHelperId,
  helperPrefix,
  useVmodelHelperCode,
  useVmodelHelperId,
} from './core/helper'

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

function resolveOption(
  options: Options,
  framework: UnpluginContextMeta['framework']
): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC].concat(
      version === 2 && framework === 'webpack' ? REGEX_VUE_SUB : []
    ),
    unified: true,
    ...options,
    version,
  }
}

const name = 'unplugin-vue-define-models'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOption(userOptions, framework)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (id.startsWith(helperPrefix)) return id
      },

      loadInclude(id) {
        return id.startsWith(helperPrefix)
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
