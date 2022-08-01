import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { transform } from './core/transform'
import type { defineComponent } from 'vue'
import type { FilterPattern } from '@rollup/pluginutils'

declare global {
  const defineOptions: typeof defineComponent
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
}

export type OptionsResolved = Required<Options>

function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.vue$/, /\.vue\?vue/],
    exclude: options.exclude || undefined,
  }
}

export default createUnplugin<Options>((options = {}) => {
  const opt = resolveOption(options)
  const filter = createFilter(opt.include, opt.exclude)

  const name = 'unplugin-vue-define-options'
  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      try {
        const s = transform(code, id)
        if (!s) return
        return {
          code: s.toString(),
          get map() {
            return s.generateMap()
          },
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})

export { transform }
