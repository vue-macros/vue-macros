import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
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
    include: options.include || [/\.vue$/],
    exclude: options.exclude || undefined,
  }
}

export default createUnplugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)

  const name = 'unplugin-vue-define-options'
  return {
    name,

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
})

export { transform }
