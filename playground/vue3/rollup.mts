import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from 'unplugin-vue-macros/rollup'
import Esbuild from 'rollup-plugin-esbuild'
import NodeResolve from '@rollup/plugin-node-resolve'

const bundle = await rollup({
  input: ['./src/main.ts'],
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
          reactivityTransform: true,
        }),
        vueJsx: VueJsx(),
      },
    }),
    NodeResolve(),
    Esbuild({
      target: 'esnext',
    }),
  ],
  external: ['vue'],
})

await bundle.write({
  dir: path.resolve(fileURLToPath(import.meta.url), '../dist/rollup'),
})
