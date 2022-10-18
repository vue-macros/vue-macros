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
      // setupComponent: false,
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
          reactivityTransform: true,
          inlineTemplate: false,
          template: {
            compilerOptions: {
              nodeTransforms: [
                transformShortVmodel({
                  prefix: '$',
                }),
              ],
            },
          },
        }),
        vueJsx: VueJsx(),
      },
    }),

    Inspect(),
  ],
})
