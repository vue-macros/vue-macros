import Inspect from 'vite-plugin-inspect'

export default defineNuxtConfig({
  modules: ['@vue-macros/nuxt'],
  macros: {},
  experimental: {
    reactivityTransform: true,
  },
  vite: {
    plugins: [Inspect()],
  },
})
