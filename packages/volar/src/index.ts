import booleanProp from './boolean-prop'
import defineEmit from './define-emit'
import defineGeneric from './define-generic'
import defineModels from './define-models'
import defineOptions from './define-options'
import defineProp from './define-prop'
import defineProps from './define-props'
import definePropsRefs from './define-props-refs'
import defineSlots from './define-slots'
import exportExpose from './export-expose'
import exportProps from './export-props'
import exportRender from './export-render'
import jsxDirective from './jsx-directive'
import scriptLang from './script-lang'
import setupJsdoc from './setup-jsdoc'
import setupSFC from './setup-sfc'
import shortBind from './short-bind'
import shortVmodel from './short-vmodel'
import templateRef from './template-ref'
import type { VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = (ctx) => {
  return [
    defineOptions,
    defineModels,
    defineProps,
    definePropsRefs,
    shortBind,
    shortVmodel,
    defineSlots,
    jsxDirective,
    setupJsdoc,
    booleanProp,
    exportRender,
    exportProps,
    exportExpose,
    defineProp,
    defineEmit,
    defineGeneric,
    setupSFC,
    scriptLang,
    templateRef,
  ].flatMap((plugin) => plugin(ctx))
}

export default plugin
