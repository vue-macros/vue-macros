import type { WritableComputedRef } from 'vue'

export const defineModel: <T>() => {
  [K in keyof T]: WritableComputedRef<T[K]>
}
export const $defineModel: <T>() => T
