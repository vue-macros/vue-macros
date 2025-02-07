import type { TransformError } from '@vue-macros/common'

export type ErrorVueSFC = '<script> is not supported, only <script setup>.'
export type ErrorResolveTS =
  | 'Cannot resolve TS definition.'
  | 'Cannot resolve TS definition. Union type contains different types of results.'
  | `Cannot resolve TS definition: ${string}`
  | `Cannot resolve TS type: ${string}`
export type ErrorWithDefaults =
  'withDefaults: first argument must be a defineProps call.'
export type ErrorUnknownNode =
  | `Unknown node: ${string}`
  | `Unknown ${'import' | 'export'} type: ${string}`
export type Error = TransformError<
  ErrorVueSFC | ErrorResolveTS | ErrorWithDefaults | ErrorUnknownNode
>

export type ResultAsync<T> = import('neverthrow').ResultAsync<T, Error>
