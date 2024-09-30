import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  booleanProp: true,
  defineEmit: true,
  defineProp: true,
  exportRender: true,
  jsxRef: true,
  scriptLang: true,
  setupSFC: true,
})
