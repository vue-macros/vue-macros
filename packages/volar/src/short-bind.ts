import { transformShortBind } from '@vue-macros/short-bind/api'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'shortBind'> = (ctx, options = {}) => {
  if (!options) return []

  return {
    name: 'vue-macros-short-bind',
    version: 2.1,
    resolveTemplateCompilerOptions(options) {
      options.nodeTransforms ||= []
      options.nodeTransforms.push(
        transformShortBind({ version: ctx.vueCompilerOptions.target }),
      )
      return options
    },
  }
}

export default plugin
