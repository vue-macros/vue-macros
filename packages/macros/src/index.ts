import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { getPackageInfoSync } from 'local-pkg'
import { transform as transformDefineOptions } from 'unplugin-vue-define-options'
import {
  finalizeContext,
  getTransformResult,
  initContext,
} from '@vue-macros/common'
import { transformDefineModel } from './define-model'
import { transformHoistStatic } from './hoist-static/transfrom'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
  hoistStatic?: boolean
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
    include: options.include || [/\.vue$/],
    exclude: options.exclude || undefined,
    version,
    defineOptions: options.defineOptions ?? true,
    defineModel: options.defineModel ?? true,
    hoistStatic: options.defineModel ?? true,
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
        const { ctx, getMagicString } = initContext(code, id)
        if (options.hoistStatic) {
          transformHoistStatic(ctx)
        }
        if (options.defineOptions) {
          transformDefineOptions(ctx)
        }
        if (options.defineModel) {
          transformDefineModel(ctx, options.version)
        }
        finalizeContext(ctx)

        return getTransformResult(getMagicString(), id)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
