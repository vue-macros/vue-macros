import { transformShortBind } from '@vue-macros/short-bind/api'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = () => {
  return {
    name: 'vue-macros-short-bind',
    version: 2,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(transformShortBind())
      return options
    },
  }
}

export default plugin
