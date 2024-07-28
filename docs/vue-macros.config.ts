import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  scriptLang: true,
  setupSFC: true,
  booleanProp: true,
  defineEmit: true,
  defineProp: true,
  templateRef: true,
  defineGeneric: true,
})
