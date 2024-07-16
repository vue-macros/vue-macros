// @ts-check
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'

/** @type {import('unplugin-vue-macros').Options} */
export default {
  setupBlock: true,
  scriptLang: true,

  defineOptions: true,
  defineSlots: true,
  hoistStatic: true,
  shortEmits: true,
  shortBind: true,

  namedTemplate: false,
  setupSFC: true,
  booleanProp: true,

  exportProps: {
    include: [/export-props.*\.vue$/],
  },
  exportExpose: {
    include: [/export-expose.*\.vue$/],
  },
  exportRender: {
    include: [/export-render.*\.vue$/],
  },
  reactivityTransform: true,

  plugins: {
    vue: Vue({
      include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
      script: {
        hoistStatic: false,
      },
    }),
    vueJsx: VueJsx(),
  },
}
