import type { ComponentPropsOptions, ComputedRef, PropType } from 'vue'

type ComponentPropOption<T> = Exclude<
  ComponentPropsOptions<{ value: T }>,
  string[]
>['value']
type DefinePropOptions<T> = Exclude<ComponentPropOption<T>, PropType<T> | null>

/** Types for the default Kevin edition. */
export declare function defineProp<T>(
  name: string,
  options:
    | ({ default: T } & DefinePropOptions<T>)
    | ({ required: true } & DefinePropOptions<T>),
): ComputedRef<T>
export declare function defineProp<T>(
  name?: string,
  options?: DefinePropOptions<T>,
): ComputedRef<T | undefined>

/** Types for the default Kevin edition with reactivity transform. */
export declare function $defineProp<T>(
  name: string,
  options:
    | ({ default: T } & DefinePropOptions<T>)
    | ({ required: true } & DefinePropOptions<T>),
): T
export declare function $defineProp<T>(
  name?: string,
  options?: DefinePropOptions<T>,
): T | undefined
