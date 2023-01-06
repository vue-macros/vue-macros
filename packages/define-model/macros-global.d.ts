import type {
  UseModelOptions,
  $defineModel as _$defineModel,
  ModelOptions as _ModelOptions,
  defineModel as _defineModel,
} from './macros'

declare global {
  const defineModel: typeof _defineModel
  const $defineModel: typeof _$defineModel
  type ModelOptions<T, O extends UseModelOptions<T> = {}> = _ModelOptions<T, O>
}

export {}
