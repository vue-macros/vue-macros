import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  vueCompilerOptions.macros.defineProps.push('$defineProps')

  return {
    name: 'vue-macros-define-props',
    version: 2,
  }
}

export default plugin
