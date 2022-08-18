import type { DefineComponent, RenderFunction, defineComponent } from 'vue'

declare global {
  const defineModel: <T>() => T
  const defineRender: (render: RenderFunction) => void
  const defineOptions: typeof defineComponent
  const defineSetupComponent: (
    fn: () => void | Promise<void> | (() => JSX.Element | Promise<JSX.Element>)
  ) => DefineComponent<any, any, any, any>
}

export {}
