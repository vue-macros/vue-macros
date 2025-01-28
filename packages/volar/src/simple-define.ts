import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  vueCompilerOptions.macros.defineProps.push('simpleProps', 'simpleEmits')

  return {
    name: 'vue-macros-simple-define',
    version: 2.1,
  }
}

export default plugin
