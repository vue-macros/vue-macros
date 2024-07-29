import { transformShortBind } from '@vue-macros/short-bind/api'
import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'shortBind')
  if (!volarOptions) return []

  return {
    name: 'vue-macros-short-bind',
    version: 2.1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(transformShortBind())
      return options
    },
  }
}

export default plugin
