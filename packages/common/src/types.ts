export type MarkRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type RecordToUnion<T extends Record<string, any>> = T[keyof T]
export type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => 0 : never
) extends (arg: infer I) => 0
  ? I
  : never
