import { defineConfig } from 'astro/config'
import Vue from '@astrojs/vue'
import Macros from '@vue-macros/astro'
// import { transformShortVmodel } from '@vue-macros/short-vmodel'

// https://astro.build/config
export default defineConfig({
  integrations: [
    Vue({
      jsx: true,
      template: {
        compilerOptions: {
          // explicit node transforms is just ok
          // nodeTransforms: [transformShortVmodel()]
        },
      },
    }),
    Macros(),
  ],
})
