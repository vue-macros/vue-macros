import { transformShortVmodel } from '@vue-macros/short-vmodel'
import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

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
        }),
      )
      return options
    },
  }
}

export default plugin
