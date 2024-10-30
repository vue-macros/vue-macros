import { HELPER_PREFIX } from '@vue-macros/common'

export const globalTypes: string = `
const { defineModel } = await import('vue')
declare function defineSlots<T extends Record<string, any>>(slots?: Partial<T>): T;
declare function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): Exposed;
type __VLS_StyleArgs = [style: string, options?: { scoped?: boolean }]
declare const defineStyle: { <T>(...args: __VLS_StyleArgs): T; scss: <T>(...args: __VLS_StyleArgs)=> T; sass: <T>(...args: __VLS_StyleArgs)=> T; stylus: <T>(...args: __VLS_StyleArgs)=> T; less: <T>(...args: __VLS_StyleArgs)=> T; postcss: <T>(...args: __VLS_StyleArgs)=> T }
declare function ${HELPER_PREFIX}defineComponent<T extends ((props?: any) => any)>(setup: T, options?: Pick<import('vue').ComponentOptions, 'name' | 'inheritAttrs' | 'components'> & { props?: import('vue').ComponentObjectPropsOptions }): T;
`
