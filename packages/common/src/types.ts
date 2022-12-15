export type MarkRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U
