import { type VueLanguagePlugin } from '@volar/vue-language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  vueCompilerOptions.macros.defineProps.push('definePropsRefs')

  return {
    name: 'vue-macros-define-props-refs',
    version: 1,
  }
}

export = plugin
