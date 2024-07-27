import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions: { vueMacros, macros },
}) => {
  const volarOptions = getVolarOptions(vueMacros, 'defineProps')
  if (!volarOptions) return []

  macros.defineProps.push('$defineProps')

  return {
    name: 'vue-macros-define-props',
    version: 2.1,
  }
}

export default plugin
