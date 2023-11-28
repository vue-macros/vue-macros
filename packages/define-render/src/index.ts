import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' assert { type: 'macro' }
import { transformDefineRender } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(options: Options): OptionsResolved {
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
const name = generatePluginName()

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOptions(userOptions)
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
  },
)
