import { transformShortVmodel } from '@vue-macros/short-vmodel'
import { type VueLanguagePlugin } from '@volar/vue-language-core'
import { getVolarOptions } from './common'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  return {
    name: 'vue-macros-short-vmodel',
    version: 1,
    resolveTemplateCompilerOptions(options) {
      const volarOptions = getVolarOptions(vueCompilerOptions)

      options.nodeTransforms ||= []
      options.nodeTransforms.push(
        transformShortVmodel({
          prefix: volarOptions?.shortVmodel?.prefix || '$',
        })
      )
      return options
    },
  }
}

export default plugin
