import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import styleX from 'vite-plugin-stylex'
import VueMacros from 'vue-macros/vite'

export default defineConfig({
  build: {
    outDir: './dist/vite',
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
          script: {
            hoistStatic: false,
          },
        }),
        vueJsx: VueJsx(),
      },
    }),
    UnoCSS(),
    Inspect({
      build: true,
    }),
    styleX(),
  ],
})
