export declare function simpleProps<T extends Record<string, any>>(): {
  [key: string]: any
} & T
export declare function simpleProps<T extends Record<string, any>>(
  names: (keyof T)[],
): T

type RecordToUnion<T extends Record<string, any>> = T[keyof T]
type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => 0 : never
) extends (arg: infer I) => 0
  ? I
  : never
type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  RecordToUnion<{
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? (evt: K, ...args: Parameters<T[K]>) => void
      : (evt: K, ...args: T[K]) => void
  }>
>

export declare const simpleEmits: <T extends Record<string, any>>(
  names: (keyof T)[],
) => ShortEmits<T>

type NotUndefined<T> = T extends undefined ? never : T
type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}
type NativeType = null | number | string | boolean | symbol | Function
type InferDefault<P, T> =
  | ((props: P) => T & {})
  | (T extends NativeType ? T : never)

type NonPartial<T> = {
  [K in keyof Required<T>]: T[K]
}

type UndefinedDefault<T, Default> = Default extends undefined
  ? T
  : NotUndefined<T>

type PropsWithDefaults<T, Defaults extends InferDefaults<T>> = Readonly<
  NonPartial<Omit<T, keyof Defaults>> & {
    [K in keyof Defaults]-?: K extends keyof T
      ? UndefinedDefault<T[K], Defaults[K]>
      : never
  }
>

export declare function withDefaults<T, Defaults extends InferDefaults<T>>(
  props: T,
  defaults: Defaults,
): PropsWithDefaults<T, Defaults>
