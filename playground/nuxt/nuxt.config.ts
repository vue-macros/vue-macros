export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@unocss/nuxt',
    '../../packages/nuxt/src/index.ts',
  ],
  macros: {
    setupBlock: true,

    defineOptions: true,
    defineSlots: true,
    hoistStatic: true,
    shortEmits: true,

    namedTemplate: false,
    setupSFC: true,

    exportProps: {
      include: [/export-props.*\.vue$/],
    },
    exportExpose: {
      include: [/export-expose.*\.vue$/],
    },
    exportRender: {
      include: [/export-render.*\.vue$/],
    },
  },
})
