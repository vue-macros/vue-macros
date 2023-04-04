import { createUnplugin } from 'unplugin'
import {
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { type BaseOptions, type MarkRequired } from '@vue-macros/common'
import { type UnpluginContextMeta } from 'unplugin'
import { transformDefineSlots } from './core'

export type Options = BaseOptions
export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOption(
  options: Options,
  framework: UnpluginContextMeta['framework']
): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC].concat(
      version === 2 && framework === 'webpack' ? REGEX_VUE_SUB : []
    ),
    ...options,
    version,
  }
}

const name = 'unplugin-vue-define-slots'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOption(userOptions, framework)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        return transformDefineSlots(code, id)
      },
    }
  }
)
