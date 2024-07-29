import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  booleanProp: true,
  defineEmit: true,
  defineProp: true,
  exportRender: true,
  scriptLang: true,
  setupSFC: true,
  templateRef: true,
})
