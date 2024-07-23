import {
  createFilter,
  detectVueVersion,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformDefineRender } from './core'

export type Options = BaseOptions & {
  vapor?: boolean
}
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

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
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
        return transformDefineRender(code, id, options)
      },
    }
  },
)
export default plugin
