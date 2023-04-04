import {
  type ComponentObjectPropsOptions,
  type ExtractPropTypes,
} from 'vue/types/v3-component-props'
import { type RefValue } from '@vue-macros/reactivity-transform/vue2-macros'

export type RefValueObject<T> = {
  [K in keyof T]: RefValue<T[K]>
}

export declare function $defineProps<PropNames extends string = string>(
  props: PropNames[]
): Readonly<{
  [key in PropNames]?: any
}>
export declare function $defineProps<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(props: PP): RefValueObject<ExtractPropTypes<PP>>
export declare function $defineProps<TypeProps>(): RefValueObject<TypeProps>
