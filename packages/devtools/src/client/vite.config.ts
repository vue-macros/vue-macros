import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

const DEV_SERVER_PATH = '/__vue-macros'

export default defineConfig({
  base: DEV_SERVER_PATH,
  build: {
    outDir: '../../dist/client',
  },
  plugins: [Vue(), UnoCSS()],
})
