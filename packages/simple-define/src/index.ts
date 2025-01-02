import {
  createFilter,
  detectVueVersion,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { transformSimpleDefine } from './core'
import { useDefaultsCode, useDefaultsId } from './core/helper'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()

  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC, REGEX_VUE_SUB],
    ...options,
    version,
  }
}

const name = 'unplugin-vue-simple-define'

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}) => {
    const options = resolveOptions(userOptions)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (id === useDefaultsId) return id
      },

      load(id) {
        if (id === useDefaultsId) return useDefaultsCode
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformSimpleDefine(code, id)
      },
    }
  },
)

export default plugin
