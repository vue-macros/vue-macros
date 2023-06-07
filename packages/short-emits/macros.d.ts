import {
  type RecordToUnion,
  type UnionToIntersection,
} from '@vue-macros/common'

export type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  RecordToUnion<{
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? (evt: K, ...args: Parameters<T[K]>) => void
      : (evt: K, ...args: T[K]) => void
  }>
>
