import type { TransformError } from '@vue-macros/common'

export type ErrorMessage =
  | '<script> is not supported, only <script setup>.'
  | 'Cannot resolve TS definition.'
  | `Cannot resolve TS definition: ${string}`
  | 'withDefaults: first argument must be a defineProps call.'
  | `unknown node: ${string}`

export type ErrorVueSFC = '<script> is not supported, only <script setup>.'
export type ErrorResolveTS =
  | 'Cannot resolve TS definition.'
  | `Cannot resolve TS definition: ${string}`
  | 'Cannot resolve TS definition. Union type contains different types of results.'
  | `Cannot resolve TS type: ${string}`
export type ErrorWithDefaults =
  'withDefaults: first argument must be a defineProps call.'
export type ErrorUnknownNode = `unknown node: ${string}`
export type Error = TransformError<
  ErrorVueSFC | ErrorResolveTS | ErrorWithDefaults | ErrorUnknownNode
>
export type Result<T> = import('neverthrow').Result<T, Error>
