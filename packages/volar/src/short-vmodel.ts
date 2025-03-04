import { transformShortVmodel } from '@vue-macros/short-vmodel'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'shortVmodel'> = (_, volarOptions = {}) => {
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
export { plugin as 'module.exports' }
