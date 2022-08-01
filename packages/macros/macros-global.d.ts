import type { defineComponent } from 'vue'

declare global {
  const defineModel: <T>() => T
  const defineOptions: typeof defineComponent
}

export {}
