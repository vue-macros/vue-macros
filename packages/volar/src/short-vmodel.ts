import { transformShortVmodel } from '@vue-macros/short-vmodel'
import type { VueLanguagePlugin } from '@volar/vue-language-core'

const plugin: VueLanguagePlugin = () => {
  return {
    name: 'vue-macros-short-vmodel',
    version: 1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(transformShortVmodel({ prefix: '$' }))
      return options
    },
  }
}

export default plugin
