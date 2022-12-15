import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_SETUP_SFC, REGEX_VUE_SFC } from '@vue-macros/common'
import { transformSetupBlock } from './core'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  defaultLang?: string
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    defaultLang: 'ts',
    ...options,
  }
}

const name = 'unplugin-vue-setup-block'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options.include, options.exclude)

    return {
      name,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        try {
          return transformSetupBlock(code, id, options.defaultLang)
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },
    }
  }
)
