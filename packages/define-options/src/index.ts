import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_SETUP_SFC, REGEX_VUE_SFC } from '@vue-macros/common'
import { transform } from './core/transform'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    exclude: options.exclude || undefined,
  }
}

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options.include, options.exclude)

    const name = 'unplugin-vue-define-options'
    return {
      name,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        try {
          return transform(code, id)
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },
    }
  }
)

export { transform }
