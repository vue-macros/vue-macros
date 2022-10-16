import type {
  $defineModel as _$defineModel,
  defineModel as _defineModel,
} from './macros'

declare global {
  const defineModel: typeof _defineModel
  const $defineModel: typeof _$defineModel
}

export {}
