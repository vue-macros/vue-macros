import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import VueMacros from 'unplugin-vue-macros/vite'
import UnoCSS from 'unocss/vite'

import options from './vue-macros.config'

export default defineConfig({
  build: {
    outDir: './dist/vite',
  },
  plugins: [
    VueMacros(options),
    UnoCSS(),
    Inspect({
      build: true,
    }),
  ],
})
