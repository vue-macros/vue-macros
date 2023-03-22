import { createUnplugin } from 'unplugin'
import {
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { type BaseOptions, type MarkRequired } from '@vue-macros/common'
import { transformDefineRender } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [
      REGEX_VUE_SFC,
      REGEX_SETUP_SFC,
      /\.(vue|setup\.[cm]?[jt]sx?)\?vue/,
    ],
    version,
    ...options,
  }
}

const name = 'unplugin-vue-define-render'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'post',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformDefineRender(code, id)
      },
    }
  }
)
