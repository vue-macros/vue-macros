/// <reference types="vite/client" />
/// <reference types="unplugin-vue-macros/macros-global" />

declare type ComponentExposed<T> = T extends new (...args: any) => infer E
  ? E
  : T extends (
        props: any,
        ctx: any,
        expose: (exposed: infer E) => any,
        ...args: any
      ) => any
    ? NonNullable<E>
    : any
