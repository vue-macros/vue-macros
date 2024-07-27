import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
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
})
