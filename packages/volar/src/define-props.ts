import type { VueLanguagePlugin } from '@volar/vue-language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  vueCompilerOptions.macros.defineProps.push('$defineProps')

  return {
    name: 'vue-macros-define-props',
    version: 1,
  }
}

export = plugin
