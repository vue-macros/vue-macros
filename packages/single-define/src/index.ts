import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import {
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  detectVueVersion,
} from '@vue-macros/common'
import { RollupResolve, setResolveTSFileIdImpl } from '@vue-macros/api'
import { transformDefineSingle } from './core'

import type { PluginContext } from 'rollup'
import type { MarkRequired } from '@vue-macros/common'
import type { UnpluginContextMeta } from 'unplugin'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  version?: 2 | 3
  isProduction?: boolean
}

export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'isProduction'
>

function resolveOption(
  options: Options,
  framework: UnpluginContextMeta['framework']
): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC].concat(
      version === 2 && framework === 'webpack' ? REGEX_VUE_SUB : []
    ),
    isProduction: process.env.NODE_ENV === 'production',
    ...options,
    version,
  }
}

const name = 'unplugin-vue-single-define'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOption(userOptions, framework)
    const filter = createFilter(options.include, options.exclude)
    const { resolve, handleHotUpdate } = RollupResolve()

    return {
      name,
      enforce: 'pre',

      buildStart() {
        if (framework === 'rollup' || framework === 'vite') {
          setResolveTSFileIdImpl(resolve(this as PluginContext))
        }
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        try {
          return transformDefineSingle(code, id, options.isProduction)
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },

      vite: {
        configResolved(config) {
          options.isProduction = config.isProduction
        },

        handleHotUpdate,
      },
    }
  }
)
