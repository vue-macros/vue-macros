import { type defineProps as definePropsChainCall } from '@vue-macros/chain-call/macros'
import { type withDefaults as withDefaultsDefinePropsRefs } from '@vue-macros/define-props-refs/macros'
import { type withDefaults as withDefaultsSimpleDefine } from '@vue-macros/simple-define/macros'
import {
  type RecordToUnion,
  type UnionToIntersection,
} from '@vue-macros/common'

export { defineEmit } from '@vue-macros/define-emit/macros'
export {
  defineModels,
  $defineModels,
  type UseModelOptions,
  type ModelOptions,
} from '@vue-macros/define-models/macros'
export { defineOptions } from 'unplugin-vue-define-options/macros'
export { defineProp } from '@vue-macros/define-prop/macros'
export { $defineProps } from '@vue-macros/define-props/macros'
export { defineRender } from '@vue-macros/define-render/macros'
export { defineSlots } from '@vue-macros/define-slots/macros'
export { definePropsRefs } from '@vue-macros/define-props-refs/macros'
export * from '@vue-macros/reactivity-transform/macros'
export {
  defineSetupComponent,
  type SetupFC,
} from '@vue-macros/setup-component/macros'
export { defineEmits } from '@vue-macros/short-emits/macros'
export { simpleProps, simpleEmits } from '@vue-macros/simple-define/macros'

interface WithDefaultsMap {
  definePropsRefs: typeof withDefaultsDefinePropsRefs
  simpleDefine: typeof withDefaultsSimpleDefine
}
type WithDefaults = UnionToIntersection<RecordToUnion<WithDefaultsMap>>
export declare const withDefaults: WithDefaults

interface DefinePropsMap {
  chainCall: typeof definePropsChainCall
}
type DefineProps = UnionToIntersection<RecordToUnion<DefinePropsMap>>
export declare const defineProps: DefineProps
