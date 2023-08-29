import { defineConfig } from 'astro/config'
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [
    Vue({
      jsx: true,
    }),
    Macros(),
  ],
})
