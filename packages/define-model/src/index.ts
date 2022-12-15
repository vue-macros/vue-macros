import { createUnplugin } from 'unplugin'
import { createFilter, normalizePath } from '@rollup/pluginutils'
import {
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  detectVueVersion,
} from '@vue-macros/common'
import { transformDefineModel } from './core'
import {
  emitHelperCode,
  emitHelperId,
  helperPrefix,
  useVmodelHelperCode,
  useVmodelHelperId,
} from './core/helper'
import type { UnpluginContextMeta } from 'unplugin'
import type { MarkRequired } from '@vue-macros/common'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * Vue version
   * @default 3
   */
  version?: 2 | 3
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
    version: 3,
    unified: true,
    ...options,
  }
}

const name = 'unplugin-vue-define-model'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOption(userOptions, framework)
    const filter = createFilter(options.include, options.exclude)

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
        try {
          return transformDefineModel(
            code,
            id,
            options.version,
            options.unified
          )
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },
    }
  }
)
