import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  booleanProp: true,
  defineProp: {
    edition: 'johnsonEdition',
  },
  exportExpose: {
    include: ['**/export-expose/**'],
  },
  exportProps: {
    include: ['**/export-props/**'],
  },
  exportRender: {
    include: ['**/export-render/**', '**.setup.tsx'],
  },
  namedTemplate: false,
  scriptLang: true,

  setupBlock: true,
  setupSFC: true,
  shortVmodel: {
    prefix: '$',
  },
})
