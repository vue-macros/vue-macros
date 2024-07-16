import { type UnpluginInstance, createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_VUE_SFC,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformScriptLang } from './core'

export interface Options extends BaseOptions {
  /**
   * @default 'ts'
   */
  default?: string
}
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC],
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
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformScriptLang(code, id, options)
      },
    }
  },
)
export default plugin
