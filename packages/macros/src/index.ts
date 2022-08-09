import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { getPackageInfoSync } from 'local-pkg'
import { transform } from 'unplugin-vue-define-options'
import { transformDefineModel } from './define-model'
import type { MagicString } from 'vue/compiler-sfc'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
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
    defineOptions: options.defineOptions ?? true,
    defineModel: options.defineModel ?? true,
  }
}

export default createUnplugin<Options>((userOptions = {}) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)

  const name = 'unplugin-vue-macros'
  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      try {
        let s: MagicString | undefined
        if (options.defineModel) {
          s = transformDefineModel(code, id, options.version)
        }
        if (options.defineOptions) {
          const newString = transform(code, id)
          if (newString) s = newString
        }

        if (!s) return

        return {
          code: s.toString(),
          get map() {
            return s!.generateMap()
          },
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
