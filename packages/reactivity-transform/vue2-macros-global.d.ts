import type {
  $ as _$,
  $$ as _$$,
  $computed as _$computed,
  $customRef as _$customRef,
  $ref as _$ref,
  $shallowRef as _$shallowRef,
  $toRef as _$toRef,
} from './vue2-macros'

declare global {
  const $: typeof _$
  const $$: typeof _$$
  const $ref: typeof _$ref
  const $shallowRef: typeof _$shallowRef
  const $computed: typeof _$computed
  const $customRef: typeof _$customRef
  const $toRef: typeof _$toRef
}
