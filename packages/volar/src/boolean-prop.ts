import { transformBooleanProp } from '@vue-macros/boolean-prop/api'
import type { VueMacrosPlugin } from './common'
import type { ConstantTypes } from '@vue/compiler-dom'

const plugin: VueMacrosPlugin<'booleanProp'> = (_, options = {}) => {
  if (!options) return []

  return {
    name: 'vue-macros-boolean-prop',
    version: 2.1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(
        transformBooleanProp({
          constType: 0 satisfies ConstantTypes.NOT_CONSTANT,
        }),
      )
      return options
    },
  }
}

export default plugin
