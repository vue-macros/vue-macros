import {
  definePropsRefs,
  type withDefaults as withDefaultsDefinePropsRefs,
} from '@vue-macros/define-props-refs/vue2-macros'
import type { defineProps as definePropsChainCall } from '@vue-macros/chain-call/vue2-macros'
import type { RecordToUnion, UnionToIntersection } from '@vue-macros/common'

export * from '@vue-macros/define-emit/macros'
export * from '@vue-macros/define-models/macros'
export * from 'unplugin-vue-define-options/macros'
export * from '@vue-macros/define-prop/macros'
export * from '@vue-macros/define-props/vue2-macros'
export * from '@vue-macros/define-render/vue2-macros'
export * from '@vue-macros/define-slots/macros'
export * from '@vue-macros/reactivity-transform/vue2-macros'
export * from '@vue-macros/short-emits/macros'
export { definePropsRefs }

interface WithDefaultsMap {
  definePropsRefs: typeof withDefaultsDefinePropsRefs
}
type WithDefaults = UnionToIntersection<RecordToUnion<WithDefaultsMap>>
export declare const withDefaults: WithDefaults

interface DefinePropsMap {
  chainCall: typeof definePropsChainCall
}
type DefineProps = UnionToIntersection<RecordToUnion<DefinePropsMap>>
export declare const defineProps: DefineProps
