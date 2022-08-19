import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
// import VueMacros from 'unplugin-vue-macros/vite'
import VueHoistStatic from '@vue-macros/hoist-static/vite'
import VueDefineOptions from 'unplugin-vue-define-options/vite'
import VueDefineModel from '@vue-macros/define-model/vite'
import VueSetupSFC from '@vue-macros/setup-sfc/vite'
import VueDefineRender from '@vue-macros/define-render/vite'

export default defineConfig({
  plugins: [
    VueSetupSFC(),
    VueHoistStatic(),
    VueDefineOptions(),
    VueDefineModel(),
    // VueMacros({
    //   include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
    // }),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
      reactivityTransform: true,
    }),
    VueJsx(),
    VueDefineRender(),

    Inspect(),
  ],
})
