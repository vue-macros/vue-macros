import {
  definePropsRefs,
  type withDefaults as withDefaultsDefinePropsRefs,
} from '@vue-macros/define-props-refs/macros'
import type { defineProps as definePropsChainCall } from '@vue-macros/chain-call/macros'
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
