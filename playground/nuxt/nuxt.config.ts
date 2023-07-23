export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@unocss/nuxt',
    '../../packages/nuxt/src/index.ts',
  ],
  macros: {
    setupSFC: true,
  },
})
