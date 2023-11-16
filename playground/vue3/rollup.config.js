// @ts-check

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import VueMacros from 'unplugin-vue-macros/rollup'
import Esbuild from 'rollup-plugin-esbuild'
import NodeResolve from '@rollup/plugin-node-resolve'
import CommonJS from '@rollup/plugin-commonjs'

import options from './vue-macros.config.js'

export default defineConfig({
  input: ['./src/main.ts'],
  plugins: [
    VueMacros(options),
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
