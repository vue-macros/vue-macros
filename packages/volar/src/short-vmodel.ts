import { transformShortVmodel } from '@vue-macros/short-vmodel'
import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'shortVmodel')
  if (!volarOptions) return []

  return {
    name: 'vue-macros-short-vmodel',
    version: 2.1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(
        transformShortVmodel({
          prefix: volarOptions.prefix || '$',
        }),
      )
      return options
    },
  }
}

export default plugin
