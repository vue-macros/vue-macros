import { type WritableComputedRef } from 'vue'
import { type UseVModelOptions } from '@vueuse/core'

export type UseModelOptions<T> = Omit<UseVModelOptions<T>, 'passive'> & {
  /**
   * When passive is set to `true`, it will use `watch` to sync with props and ref.
   * Instead of relying on the `v-model` or `.sync` to work.
   *
   * @default true
   */
  passive?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ModelOptions<T, O extends UseModelOptions<T> = {}> = T

export const defineModels: <T>() => {
  [K in keyof T]-?: WritableComputedRef<T[K]>
}

export const $defineModels: <T>() => T
