import { type VuePluginApi, getVuePluginApi } from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { type Options, transformBooleanProp } from './core/index'
import type { Plugin } from 'vite'

// legacy export
export * from './api'

const name = generatePluginName()

function rollup(options: Options = {}): Plugin {
  let api: VuePluginApi | null | undefined

  return {
    name,
    configResolved(config) {
      try {
        api = getVuePluginApi(config.plugins)
      } catch {}
    },
    buildStart(rollupOpts) {
      if (api === undefined)
        try {
          api = getVuePluginApi(rollupOpts.plugins)
        } catch (error: any) {
          this.warn(error)
          return
        }

      if (!api) return

      api.options.template ||= {}
      api.options.template.compilerOptions ||= {}
      api.options.template.compilerOptions.nodeTransforms ||= []

      api.options.template.compilerOptions.nodeTransforms.push(
        transformBooleanProp(options),
      )
    },
  }
}

const plugin: {
  rollup: typeof rollup
  vite: typeof rollup
} = {
  rollup,
  vite: rollup,
}
export default plugin
