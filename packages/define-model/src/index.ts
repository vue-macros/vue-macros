import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { transformDefineModel } from './core'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * Vue version
   * @default 3
   */
  version?: 2 | 3
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  return {
    include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?/],
    version: 3,
    ...options,
  }
}

const name = 'unplugin-vue-define-model'

export default createUnplugin((userOptions: Options = {}) => {
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
        return transformDefineModel(code, id, options.version)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
