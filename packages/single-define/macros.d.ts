import type { ComputedRef } from 'vue'

// copy form vue core
type DefaultFactory<T> = (
  props: Record<string, unknown>
) => T | null | undefined
interface PropOptions<T> {
  type?: any
  required?: boolean
  default?: T | DefaultFactory<T> | null | undefined | object
  validator?(value: unknown): boolean
}

export declare function defineProp<T = any>(
  propName?: string,
  options?: PropOptions<T>
): ComputedRef<T>

type MaybeTupleFunction<T, R> = T extends any[]
  ? (...args: T) => R
  : T extends (...args: any) => any
  ? (...args: Parameters<T>) => R
  : T

export declare function defineEmit<
  T extends ((...args: any) => any) | any[] = any[]
>(
  emitName?: string,
  validator?: MaybeTupleFunction<T, any>
): MaybeTupleFunction<T, void>
