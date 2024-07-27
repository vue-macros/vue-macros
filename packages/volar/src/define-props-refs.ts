import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions: { vueMacros, macros },
}) => {
  const volarOptions = getVolarOptions(vueMacros, 'definePropsRefs')
  if (!volarOptions) return []

  macros.defineProps.push('definePropsRefs')

  return {
    name: 'vue-macros-define-props-refs',
    version: 2.1,
  }
}

export default plugin
