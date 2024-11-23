import type { NativeElements } from './dom'

export const Fragment: typeof import('vue').Fragment = {}
export const jsx: typeof import('vue').h = {}
export const jsxs: typeof import('vue').h = {}
export const jsxDEV: typeof import('vue').h = {}

declare global {
  declare namespace JSX {
    interface Element extends import('vue').VNode {}
    interface ElementClass {
      $props: {}
    }
    interface ElementAttributesProperty {
      $props: {}
    }
    interface IntrinsicElements extends NativeElements {
      [name: string]: any
    }
    interface IntrinsicAttributes
      extends import('vue').ReservedProps,
        import('vue').AllowedComponentProps,
        import('vue').ComponentCustomProps {}
  }
}
