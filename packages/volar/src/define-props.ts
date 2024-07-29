import { getVolarOptions } from './common'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'defineProps')
  if (!volarOptions) return []

  ctx.vueCompilerOptions.macros.defineProps.push('$defineProps')

  return {
    name: 'vue-macros-define-props',
    version: 2.1,
  }
}

export default plugin
