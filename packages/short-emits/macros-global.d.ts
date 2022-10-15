import type { ShortEmits as _ShortEmits } from './macros'

declare global {
  type ShortEmits<T extends Record<string, any>> = _ShortEmits<T>
  type SE<T extends Record<string, any>> = ShortEmits<T>
}

export {}
