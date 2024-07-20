/**
 * This is a generic type definition for generic component.
 *
 * @template E The extends type of the generic.
 * @template D The default type of the generic.
 *
 * @example
 * ```ts
 * type T = DefineGeneric
 * // => <script generic="T">
 *
 * type T = DefineGeneric<string>
 * // => <script generic="T extends string">
 *
 * type T = DefineGeneric<string>
 * type E = DefineGeneric<number, number>
 * // => <script generic="T extends string, E extends number = number">
 * ```
 */
declare type DefineGeneric<
  E = unknown,
  D = E,
> = import('./macros').DefineGeneric<E, D>
