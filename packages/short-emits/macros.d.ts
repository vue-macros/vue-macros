type RecordToUnion<T extends Record<string, any>> = T[keyof T]
type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => 0 : never
) extends (arg: infer I) => 0
  ? I
  : never
export type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  RecordToUnion<{
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? (evt: K, ...args: Parameters<T[K]>) => void
      : (evt: K, ...args: T[K]) => void
  }>
>
