import type { RecordToUnion, UnionToIntersection } from '@vue-macros/common'

export * from '@vue-macros/define-emit/macros'
export * from '@vue-macros/define-models/macros'
export * from 'unplugin-vue-define-options/macros'
export * from '@vue-macros/define-prop/macros'
export * from '@vue-macros/define-props/macros'
export * from '@vue-macros/define-render/macros'
export * from '@vue-macros/define-slots/macros'
export * from '@vue-macros/define-stylex/macros'
export * from '@vue-macros/reactivity-transform/macros'
export * from '@vue-macros/setup-component/macros'
export * from '@vue-macros/short-emits/macros'
export * from '@vue-macros/volar/macros'

export { definePropsRefs } from '@vue-macros/define-props-refs/macros'
export { simpleEmits, simpleProps } from '@vue-macros/simple-define/macros'

interface WithDefaultsMap {
  definePropsRefs: typeof import('@vue-macros/define-props-refs/macros').withDefaults
  simpleDefine: typeof import('@vue-macros/simple-define/macros').withDefaults
}
type WithDefaults = UnionToIntersection<RecordToUnion<WithDefaultsMap>>
export declare const withDefaults: WithDefaults

interface DefinePropsMap {
  chainCall: typeof import('@vue-macros/chain-call/macros').defineProps
}
type DefineProps = UnionToIntersection<RecordToUnion<DefinePropsMap>>
export declare const defineProps: DefineProps
