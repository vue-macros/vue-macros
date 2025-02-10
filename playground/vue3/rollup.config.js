// @ts-check

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import CommonJS from '@rollup/plugin-commonjs'
import NodeResolve from '@rollup/plugin-node-resolve'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'rollup'
import Oxc from 'unplugin-oxc/rollup'
import VueMacros from 'unplugin-vue-macros/rollup'
import Vue from 'unplugin-vue/rollup'

export default defineConfig({
  input: ['./src/main.ts'],
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
    NodeResolve(),
    CommonJS(),
    Oxc(),
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
