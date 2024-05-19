import type { ComputedRef } from 'vue'

export function defineProp<T>(
  name: string,
  options:
    | ({ required: true } & Record<string, unknown>)
    | ({ default: any } & Record<string, unknown>),
): ComputedRef<T>
export function defineProp<T>(
  name?: string,
  options?: any,
): ComputedRef<T | undefined>
