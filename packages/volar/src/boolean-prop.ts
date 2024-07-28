import { transformBooleanProp } from '@vue-macros/boolean-prop/api'
import { getVolarOptions } from './common'
import type { ConstantTypes } from '@vue/compiler-dom'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions: { vueMacros } }) => {
  const volarOptions = getVolarOptions(vueMacros, 'booleanProp')
  if (!volarOptions) return []

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
