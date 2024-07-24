import {
  createFilter,
  detectVueVersion,
  REGEX_VUE_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformScriptLang } from './core'

export interface Options extends BaseOptions {
  /**
   * @default 'ts'
   */
  defaultLang?: 'ts' | 'tsx' | 'jsx' | (string & {})
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
