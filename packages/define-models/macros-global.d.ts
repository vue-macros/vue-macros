declare const defineModels: typeof import('./macros').defineModels
declare const $defineModels: typeof import('./macros').$defineModels
declare type ModelOptions<
  T,
  O extends import('./macros').UseModelOptions<T> = {}
> = import('./macros').ModelOptions<T, O>
