import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import VueMacros from '@vue-macros/astro'

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4000,
  },
  integrations: [VueMacros({}), vue()],
})
