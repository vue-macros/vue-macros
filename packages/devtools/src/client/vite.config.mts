import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Macros from 'unplugin-macros/vite'

const DEV_SERVER_PATH = '/__vue-macros'

export default defineConfig({
  base: DEV_SERVER_PATH,
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  plugins: [
    Vue({
      script: {
        babelParserPlugins: [
          ['importAttributes', { deprecatedAssertSyntax: true }],
        ],
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
  ],
})
