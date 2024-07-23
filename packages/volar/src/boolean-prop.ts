import { transformBooleanProp } from '@vue-macros/boolean-prop/api'
import { ConstantTypes } from '@vue/compiler-core'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'booleanProp'> = (_, options = {}) => {
  if (!options) return []

  return {
    name: 'vue-macros-boolean-prop',
    version: 2.1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(
        transformBooleanProp({
          constType: ConstantTypes.NOT_CONSTANT,
        }),
      )
      return options
    },
  }
}

export default plugin
