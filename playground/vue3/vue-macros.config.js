// @ts-check
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { transformShortVmodel } from '@vue-macros/short-vmodel'
import { transformBooleanProp } from '@vue-macros/boolean-prop'

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

  plugins: {
    vue: Vue({
      include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
      reactivityTransform: true,
      script: {
        // @ts-ignore
        hoistStatic: false,
      },
      template: {
        compilerOptions: {
          nodeTransforms: [
            transformShortVmodel({
              prefix: '$',
            }),
            transformBooleanProp(),
          ],
        },
      },
    }),
    vueJsx: VueJsx(),
  },
}
