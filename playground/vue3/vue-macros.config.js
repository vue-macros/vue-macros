// @ts-check
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'

/** @type {import('unplugin-vue-macros').Options} */
export default {
  setupBlock: true,

  defineOptions: true,
  defineSlots: true,
  hoistStatic: true,
  shortEmits: true,

  namedTemplate: false,
  setupSFC: true,

  exportProps: {
    include: [/export-props.*\.vue$/],
  },
  exportExpose: {
    include: [/export-expose.*\.vue$/],
  },
  exportRender: {
    include: [/export-render.*\.vue$/],
  },

  plugins: {
    vue: Vue({
      include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
      reactivityTransform: true,
      script: {
        hoistStatic: false,
      },
    }),
    vueJsx: VueJsx(),
  },
}
