import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Macros from 'unplugin-macros/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

const DEV_SERVER_PATH = '/__vue-macros'

export default defineConfig({
  base: DEV_SERVER_PATH,
  resolve: {
    alias: {
      '#macros': path.resolve(__dirname, '../../../../macros/index.ts'),
    },
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  plugins: [
    Vue({
      script: {
        babelParserPlugins: ['importAttributes'],
      },
    }),
    UnoCSS(),
    Macros({
      viteConfig: {
        resolve: {
          alias: {
            '#macros': path.resolve(__dirname, '../../../../macros/index.ts'),
          },
        },
      },
    }),
    Inspect(),
  ],
})
