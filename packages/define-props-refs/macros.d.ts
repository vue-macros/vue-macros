import type {
  ComponentObjectPropsOptions,
  DeepReadonly,
  ExtractPropTypes,
  Ref,
  ToRefs,
} from 'vue'

export declare function definePropsRefs<PropNames extends string = string>(
  props: PropNames[]
): DeepReadonly<{
  [key in PropNames]: Readonly<Ref<any>>
}>
export declare function definePropsRefs<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(props: PP): DeepReadonly<Required<ToRefs<ExtractPropTypes<PP>>>>

export declare function definePropsRefs<TypeProps>(): DeepReadonly<
  Required<ToRefs<TypeProps>>
>
