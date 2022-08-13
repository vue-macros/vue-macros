import type { defineComponent } from 'vue'

export * from './core'

declare global {
  const defineOptions: typeof defineComponent
}
