import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from 'unplugin-vue-macros/vite'
import VueSetupSFC from '@vue-macros/setup-sfc/vite'

export default defineConfig({
  plugins: [
    VueSetupSFC(),
    VueMacros({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
    }),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
      reactivityTransform: true,
    }),
    VueJsx(),
    Inspect(),
  ],
})
