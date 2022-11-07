import { existsSync } from 'node:fs'
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_SETUP_SFC, REGEX_VUE_SFC } from '@vue-macros/common'
import { setResolveTSFileIdImpl } from '@vue-macros/api'
import { transformBetterDefine } from './core'
import type { ResolveTSFileIdImpl } from '@vue-macros/api'
import type { PluginContext } from 'rollup'
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
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    ...options,
  }
}

const name = 'unplugin-vue-better-define'

export default createUnplugin<Options | undefined>((userOptions = {}, meta) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)

  return {
    name,
    enforce: 'pre',

    buildStart() {
      if (meta.framework === 'rollup' || meta.framework === 'vite') {
        const ctx = this as PluginContext
        const resolveFn: ResolveTSFileIdImpl = async (id, importer) => {
          let resolved = (await ctx.resolve(id, importer))?.id
          if (!resolved) return
          if (existsSync(resolved)) return resolved

          resolved = (await ctx.resolve(resolved))?.id
          if (resolved && existsSync(resolved)) return resolved
        }
        setResolveTSFileIdImpl(resolveFn)
      }
    },

    transformInclude(id) {
      return filter(id)
    },

    async transform(code, id) {
      try {
        return await transformBetterDefine(code, id)
      } catch (err: unknown) {
        this.warn(`${name} ${err}`)
        console.warn(err)
      }
    },
  }
})
