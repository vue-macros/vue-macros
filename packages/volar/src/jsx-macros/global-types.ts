import { HELPER_PREFIX } from '@vue-macros/common'
import type { TransformOptions } from '.'

export function getGlobalTypes(options: TransformOptions): string {
  return `
const { defineModel${options.defineModel.alias[0] !== 'defineModel' ? `: ${options.defineModel.alias[0]}` : ''} } = await import('vue')
declare function ${options.defineSlots.alias[0]}<T extends Record<string, any>>(): Partial<T>;
declare function ${options.defineSlots.alias[0]}<T extends Record<string, any>>(slots: T): T;
declare function ${options.defineExpose.alias[0]}<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): Exposed;
type __VLS_StyleArgs = [style: string, options?: { scoped?: boolean }];
declare const ${options.defineStyle.alias[0]}: { <T>(...args: __VLS_StyleArgs): T; scss: <T>(...args: __VLS_StyleArgs)=> T; sass: <T>(...args: __VLS_StyleArgs)=> T; stylus: <T>(...args: __VLS_StyleArgs)=> T; less: <T>(...args: __VLS_StyleArgs)=> T; postcss: <T>(...args: __VLS_StyleArgs)=> T };
declare function ${HELPER_PREFIX}${options.defineComponent.alias[0]}<T extends ((props?: any) => any)>(setup: T, options?: Pick<import('vue').ComponentOptions, 'name' | 'inheritAttrs' | 'components'> & { props?: import('vue').ComponentObjectPropsOptions }): T;
`
}
