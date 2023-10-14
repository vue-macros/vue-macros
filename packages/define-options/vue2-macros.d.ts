import type {
  ComponentOptionsMixin,
  ComponentOptionsWithoutProps,
  ComputedOptions,
  MethodOptions,
} from 'vue/types/v3-component-options'

export declare function defineOptions<
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
>(
  options?: ComponentOptionsWithoutProps<
    {},
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends
  > & { emits?: undefined; expose?: undefined; slots?: undefined }
): void
