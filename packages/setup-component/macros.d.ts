import type { DefineComponent } from 'vue'

export declare const defineSetupComponent: (
  fn: () => void | Promise<void> | (() => JSX.Element | Promise<JSX.Element>)
) => DefineComponent<any, any, any, any>
