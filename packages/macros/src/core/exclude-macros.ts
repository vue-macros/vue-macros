import type { Plugin } from 'vite'

export function excludeDepOptimize(): Plugin {
  return {
    name: 'vue-macros-exclude-dep-optimize',
    config() {
      return {
        optimizeDeps: {
          exclude: ['vue-macros/macros'],
        },
      }
    },
  }
}
