import {
  type ComponentObjectPropsOptions,
  type ComputedRef,
  type DeepReadonly,
  type ExtractPropTypes,
  type Ref,
} from 'vue'

export declare type PropRefs<T> = {
  [K in keyof T]-?: ComputedRef<DeepReadonly<T[K]>>
}

export declare type NotUndefined<T> = T extends undefined ? never : T

export declare type InferDefault<P, T> = T extends
  | null
  | number
  | string
  | boolean
  | symbol
  | Function
  ? T | ((props: P) => T)
  : (props: P) => T

export declare type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, NotUndefined<T[K]>>
}

export declare type PropsWithDefaults<Base, Defaults> = Base & {
  [K in keyof Defaults]: K extends keyof Base
    ? Defaults[K] extends undefined
      ? Base[K]
      : NotUndefined<Base[K]>
    : never
}

export declare function withDefaults<
  Props,
  Defaults extends InferDefaults<Props>
>(props: Props, defaults: Defaults): PropsWithDefaults<Props, Defaults>

export declare function withDefaults<
  PropsWithRefs extends PropRefs<Record<string, any>>,
  Defaults extends InferDefaults<Props>,
  Props = {
    -readonly [K in keyof PropsWithRefs]: PropsWithRefs[K] extends Readonly<
      Ref<infer T>
    >
      ? T
      : PropsWithRefs[K]
  }
>(props: PropsWithRefs, defaults: Defaults): PropRefs<Props>

export declare function definePropsRefs<PropNames extends string = string>(
  props: PropNames[]
): PropRefs<{
  [key in PropNames]: Ref<any>
}>
export declare function definePropsRefs<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(props: PP): PropRefs<ExtractPropTypes<PP>>

export declare function definePropsRefs<TypeProps>(): PropRefs<TypeProps>
