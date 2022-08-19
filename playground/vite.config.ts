import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueHoistStatic from '@vue-macros/hoist-static/vite'
import VueDefineOptions from 'unplugin-vue-define-options/vite'
import VueDefineModel from '@vue-macros/define-model/vite'
import VueSetupSFC from '@vue-macros/setup-sfc/vite'
import VueSetupComponent from '@vue-macros/setup-component/vite'
import VueDefineRender from '@vue-macros/define-render/vite'

export default defineConfig({
  plugins: [
    VueSetupSFC(),
    VueSetupComponent(),
    VueHoistStatic(),
    VueDefineOptions(),
    VueDefineModel(),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/],
      reactivityTransform: true,
    }),
    VueJsx(),
    VueDefineRender(),

    Inspect(),
  ],
})
