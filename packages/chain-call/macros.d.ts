import type { ComponentObjectPropsOptions, ExtractPropTypes } from 'vue'

// copy from vue-core
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type NotUndefined<T> = T extends undefined ? never : T
type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}
type NativeType = null | number | string | boolean | symbol | Function
type InferDefault<P, T> =
  | ((props: P) => T & {})
  | (T extends NativeType ? T : never)
type PropsWithDefaults<
  T,
  Defaults extends InferDefaults<T>,
  BKeys extends keyof T,
> = Omit<T, keyof Defaults> & {
  [K in keyof Defaults]-?: K extends keyof T
    ? Defaults[K] extends undefined
      ? T[K]
      : NotUndefined<T[K]>
    : never
} & {
  readonly [K in BKeys]-?: boolean
}
type DefineProps<T, BKeys extends keyof T> = Readonly<T> & {
  readonly [K in BKeys]-?: boolean
}
type BooleanKey<T, K extends keyof T = keyof T> = K extends any
  ? [T[K]] extends [boolean | undefined]
    ? K
    : never
  : never

// end

export type AttachWithDefaults<Props> = Props & {
  withDefaults: (() => Props) &
    (<BKeys extends BooleanKey<Props>, Defaults extends InferDefaults<Props>>(
      defaults?: Defaults,
    ) => Prettify<PropsWithDefaults<Props, Defaults, BKeys>>)
}

export declare function defineProps<PropNames extends string = string>(
  props: PropNames[],
): Prettify<
  AttachWithDefaults<
    Readonly<{
      [key in PropNames]?: any
    }>
  >
>
export declare function defineProps<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions,
>(props: PP): Prettify<AttachWithDefaults<Readonly<ExtractPropTypes<PP>>>>

export declare function defineProps<TypeProps>(): AttachWithDefaults<
  DefineProps<TypeProps, BooleanKey<TypeProps>>
>
