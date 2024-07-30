// @ts-check

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import CommonJS from '@rollup/plugin-commonjs'
import NodeResolve from '@rollup/plugin-node-resolve'
import Vue from '@vitejs/plugin-vue2'
import VueJsx from '@vitejs/plugin-vue2-jsx'
import { defineConfig } from 'rollup'
import Esbuild from 'rollup-plugin-esbuild'
import VueMacros from 'unplugin-vue-macros/rollup'

export default defineConfig({
  input: ['./src/main.ts'],
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
        }),
        vueJsx: VueJsx(),
      },
    }),
    NodeResolve(),
    CommonJS(),
    Esbuild({
      target: 'esnext',
    }),
  ],
  external: (id) => {
    if (id === 'vue') return true
    return id.endsWith('.css')
  },
  onwarn(warning, defaultHandler) {
    if (
      ['UNRESOLVED_IMPORT', 'UNUSED_EXTERNAL_IMPORT'].includes(
        warning.code || '',
      )
    )
      return
    defaultHandler(warning)
  },
  output: {
    dir: path.resolve(fileURLToPath(import.meta.url), '../dist/rollup'),
  },
})
