/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />
/// <reference types="unplugin-vue-macros/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
