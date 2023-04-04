import { type ComputedRef } from 'vue'

export function defineProp<T>(
  value: T | (() => T),
  required?: boolean,
  rest?: any
): ComputedRef<T>
export function defineProp<T>(
  value: T | (() => T) | undefined,
  required: true,
  rest?: any
): ComputedRef<T>
export function defineProp<T>(
  value?: T | (() => T),
  required?: boolean,
  rest?: any
): ComputedRef<T | undefined>
