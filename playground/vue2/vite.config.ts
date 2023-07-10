import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import UnoCSS from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'

import config from './vue-macros.config'

export default defineConfig({
  build: {
    outDir: './dist/vite',
  },
  plugins: [
    VueMacros(config),
    UnoCSS(),
    Inspect({
      build: true,
    }),
  ],
  esbuild: {
    jsx: 'preserve',
  },
})
