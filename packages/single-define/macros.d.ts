import type { ComputedRef, PropType } from 'vue'

type DefaultFactory<T> = (props: Data) => T | null | undefined
interface PropOptions<T = any> {
  type?: PropType<T> | true | null
  required?: boolean
  default?: T | DefaultFactory<T> | null | undefined | object
  validator?(value: unknown): boolean
}

export declare function defineEmit<T>(
  emitName: string,
  validataion?: (payload: T) => Boolean
): (payload?: T) => void

export declare function defineProp<T>(
  propName: string,
  options?: PropOptions<T>
): ComputedRef<T>
