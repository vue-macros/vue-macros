import { type Plugin } from 'rollup'
import { type Plugin as VitePlugin } from 'vite'
import { type VuePluginApi, getVuePluginApi } from '@vue-macros/common'
import { type Options, transformBooleanProp } from './core/index'
import { generatePluginName } from '#macros' assert { type: 'macro' }

// legacy export
export * from './api'

const name = generatePluginName()

function rollup(options: Options = {}): Plugin {
  return {
    name,
    buildStart(rollupOpts) {
      let api: VuePluginApi

      try {
        api = getVuePluginApi(rollupOpts)
      } catch (error: any) {
        this.warn(error)
        return
      }

      api.options.template ||= {}
      api.options.template.compilerOptions ||= {}
      api.options.template.compilerOptions.nodeTransforms ||= []

      api.options.template.compilerOptions.nodeTransforms.push(
        transformBooleanProp(options)
      )
    },
  }
}

export default {
  rollup,
  vite: rollup as (options?: Options) => VitePlugin,
}
