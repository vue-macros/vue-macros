import type { ShortEmits as _ShortEmits } from './macros'

declare global {
  type ShortEmits<T> = _ShortEmits<T>
  type SE<T> = ShortEmits<T>
}

export {}
