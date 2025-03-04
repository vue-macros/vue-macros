import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'defineProp'> = (ctx, options = {}) => {
  if (!options) return []

  ctx.vueCompilerOptions.macros.defineProps.push('$defineProps')

  return {
    name: 'vue-macros-define-props',
    version: 2.1,
  }
}

export default plugin
export { plugin as 'module.exports' }
