import { transformBooleanProp } from '@vue-macros/boolean-prop/api'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = () => {
  return {
    name: 'vue-macros-boolean-prop',
    version: 2,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(transformBooleanProp({ constType: 0 }))
      return options
    },
  }
}

export default plugin
