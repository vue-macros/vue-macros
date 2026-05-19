/**
 * Define a reactive prop for the component.
 *
 * Kevin Edition:
 *   defineProp(name?, definition?)
 *
 * Johnson Edition:
 *   defineProp(value?, required?, rest?)
 */

/** Kevin Edition: defineProp(name?, definition?) */
export declare function defineProp<T = any>(
  name?: string,
  definition?: {
    type?: T
    required?: boolean
    default?: T | (() => T)
    validator?: (value: T) => boolean
  },
): T

/** Johnson Edition: defineProp(value?, required?, rest?) */
export declare function defineProp<T = any>(
  value?: T,
  required?: boolean,
  rest?: Record<string, any>,
): T

/** Kevin Edition with $ (reactive transform) */
export declare function $defineProp<T = any>(
  name?: string,
  definition?: {
    type?: T
    required?: boolean
    default?: T | (() => T)
    validator?: (value: T) => boolean
  },
): T

/** Johnson Edition with $ (reactive transform) */
export declare function $defineProp<T = any>(
  value?: T,
  required?: boolean,
  rest?: Record<string, any>,
): T
