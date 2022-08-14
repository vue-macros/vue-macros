import type { DefineComponent, defineComponent } from 'vue'

declare global {
  const defineModel: <T>() => T
  const defineOptions: typeof defineComponent
  const defineSetupComponent: (
    fn: () => void | Promise<void>
  ) => DefineComponent<any, any, any, any>
}

export {}
