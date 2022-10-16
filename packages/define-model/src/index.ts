import { createUnplugin } from 'unplugin'
import { createFilter, normalizePath } from '@rollup/pluginutils'
import { REGEX_SETUP_SFC, REGEX_VUE_SFC } from '@vue-macros/common'
import { transformDefineModel } from './core'
import {
  emitHelperCode,
  emitHelperId,
  helperPrefix,
  useVmodelHelperCode,
  useVmodelHelperId,
} from './core/helper'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * Vue version
   * @default 3
   */
  version?: 2 | 3
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    version: 3,
    ...options,
  }
}

const name = 'unplugin-vue-define-model'

export default createUnplugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
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
        return transformDefineModel(code, id, options.version)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
