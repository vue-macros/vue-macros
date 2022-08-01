import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { getPackageInfoSync } from 'local-pkg'
import { transform } from './core/transform'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  version?: 2 | 3
}

export type OptionsResolved = Required<Options>

function resolveOption(options: Options): OptionsResolved {
  let version: 2 | 3 | undefined = options.version
  if (version === undefined) {
    const vuePkg = getPackageInfoSync('vue')
    if (vuePkg) {
      version = +vuePkg.version.slice(0, 1) as 2 | 3
    } else {
      version = 3
    }
  }

  return {
    include: options.include || [/\.vue$/, /\.vue\?vue/],
    exclude: options.exclude || undefined,
    version,
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
        return transform(code, id, opt.version)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})

export { transform }
