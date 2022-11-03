import type { RefValue } from 'vue/macros'

export declare function $defineProps<PropNames extends string = string>(
  props: PropNames[]
): Readonly<{
  [key in PropNames]?: any
}>
export declare function $defineProps<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(props: PP): Readonly<ExtractPropTypes<PP>>
export declare function $defineProps<TypeProps>(): {
  [Key in keyof TypeProps]: RefValue<TypeProps[Key]>
}
