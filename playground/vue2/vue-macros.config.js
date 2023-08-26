// @ts-check
import Vue from '@vitejs/plugin-vue2'
import VueJsx from '@vitejs/plugin-vue2-jsx'

/** @type {import('unplugin-vue-macros').Options} */
export default {
  setupBlock: true,

  namedTemplate: false,
  setupSFC: true,
  defineProp: {
    edition: 'johnsonEdition',
  },

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
    }),
    vueJsx: VueJsx(),
  },
}
