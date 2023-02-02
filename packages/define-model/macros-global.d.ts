declare const defineModel: typeof import('./macros').defineModel
declare const $defineModel: typeof import('./macros').$defineModel
declare type ModelOptions<
  T,
  O extends import('./macros').UseModelOptions<T> = {}
> = import('./macros').ModelOptions<T, O>
