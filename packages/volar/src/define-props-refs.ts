import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'definePropsRefs'> = (ctx, options = {}) => {
  if (!options) return []

  ctx.vueCompilerOptions.macros.defineProps.push('definePropsRefs')

  return {
    name: 'vue-macros-define-props-refs',
    version: 2.1,
  }
}

export default plugin
export { plugin as 'module.exports' }
