import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { transfromDefineRender } from './core'
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
    include: [/\.vue$/, /(\.vue|\.setup\.[cm]?[jt]sx?)\?vue/],
    ...options,
  }
}

const name = 'unplugin-vue-define-render'

export default createUnplugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)

  return {
    name,
    enforce: 'post',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      try {
        return transfromDefineRender(code, id)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
