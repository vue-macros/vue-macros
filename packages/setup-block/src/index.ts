import { createUnplugin } from 'unplugin'
import {
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { type BaseOptions, type MarkRequired } from '@vue-macros/common'
import { transformSetupBlock } from './core'

export interface Options extends BaseOptions {
  defaultLang?: string
}

export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    defaultLang: 'ts',
    ...options,
    version,
  }
}

const name = 'unplugin-vue-setup-block'

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
        return transformSetupBlock(code, id, options.defaultLang)
      },
    }
  }
)
