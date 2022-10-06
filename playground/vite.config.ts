import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from 'unplugin-vue-macros/vite'
import { transformShortVmodel } from '@vue-macros/short-vmodel'

export default defineConfig({
  build: {
    outDir: './dist/vite',
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
          reactivityTransform: true,
          template: {
            compilerOptions: {
              nodeTransforms: [transformShortVmodel()],
            },
          },
        }),
        vueJsx: VueJsx(),
      },
    }),

    Inspect(),
  ],
})
