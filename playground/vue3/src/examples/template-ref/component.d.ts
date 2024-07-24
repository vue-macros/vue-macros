declare module 'vue' {
  export interface GlobalComponents {
    Comp: (typeof import('./comp.vue'))['default']
  }
}

export {}
