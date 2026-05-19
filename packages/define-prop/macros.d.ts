/**
 * Define a reactive prop for the component.
 *
 * @param name - The name of the prop (optional, defaults to variable name)
 * @param definition - The prop definition options (optional)
 * @returns A reactive reference to the prop value
 */
export declare function defineProp<T = any>(
  name?: string,
  definition?: {
    type?: T
    required?: boolean
    default?: T | (() => T)
    validator?: (value: T) => boolean
  }
): T

/**
 * Define a reactive prop with $ syntax for reactive transform.
 *
 * @param name - The name of the prop (optional, defaults to variable name)
 * @param definition - The prop definition options (optional)
 * @returns A reactive reference to the prop value
 */
export declare function $defineProp<T = any>(
  name?: string,
  definition?: {
    type?: T
    required?: boolean
    default?: T | (() => T)
    validator?: (value: T) => boolean
  }
): T
