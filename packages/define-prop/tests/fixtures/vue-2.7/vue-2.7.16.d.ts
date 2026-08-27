// Minimal local shim for the Vue 2.7.16 root type surface, not an installed dependency.
// The prop option fields mirror types/options.d.ts; Prop is intentionally absent.
export interface ComputedRef<T> {
  readonly value: T
}

type PropConstructor<T> =
  | { (): T }
  | { new (...args: never[]): T & object }
  | { new (...args: string[]): Function }

export type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

interface PropOptions<T = any> {
  type?: PropType<T>
  required?: boolean
  default?: T | null | undefined | (() => T | null | undefined)
  validator?(value: unknown): boolean
}

export type ComponentPropsOptions<P = Record<string, any>> =
  | { [K in keyof P]: PropOptions<P[K]> | PropType<P[K]> | null }
  | string[]
