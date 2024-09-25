import { transformDirective } from '@vue-macros/define-stylex'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'defineStyleX'> = (_, volarOptions = {}) => {
  if (!volarOptions) return []

  return {
    name: 'vue-macros-define-stylex',
    version: 2.1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(transformDirective())
      return options
    },
  }
}

export default plugin
