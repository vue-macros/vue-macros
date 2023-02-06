import Inspect from 'vite-plugin-inspect'

export default defineNuxtConfig({
  modules: ['../packages/nuxt'],
  macros: {},
  experimental: {
    reactivityTransform: true,
  },
  vite: {
    plugins: [Inspect()],
  },
})
