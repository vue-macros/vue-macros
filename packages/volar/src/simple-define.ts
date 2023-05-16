import { type VueLanguagePlugin } from '@volar/vue-language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  vueCompilerOptions.macros.defineProps.push('simpleProps')

  return {
    name: 'vue-macros-simple-define',
    version: 1,
  }
}

export = plugin
