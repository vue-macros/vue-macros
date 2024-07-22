import defineEmit from './define-emit'
import defineModels from './define-models'
import definePropsRefs from './define-props-refs'
import defineSlots from './define-slots'
import JsxDirective from './jsx-directive'
import setupJsdoc from './setup-jsdoc'
import shortVmodel from './short-vmodel'
import templateRef from './template-ref'
import type {
  VueLanguagePlugin,
  VueLanguagePluginReturn,
} from '@vue/language-core'

const plugin: VueLanguagePlugin = (...args) => {
  return mergePlugins(args, [
    defineEmit,
    defineModels,
    definePropsRefs,
    defineSlots,
    JsxDirective,
    setupJsdoc,
    shortVmodel,
    templateRef,
  ])
}
export default plugin

function mergePlugins(
  args: Parameters<VueLanguagePlugin>,
  plugins: VueLanguagePlugin[],
): VueLanguagePluginReturn[] {
  return plugins.map((plugin) => plugin(...args) as VueLanguagePluginReturn)
}
