import { transformShortBind } from '@vue-macros/short-bind/api'
import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions: { vueMacros } }) => {
  const volarOptions = getVolarOptions(vueMacros, 'shortBind')
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
