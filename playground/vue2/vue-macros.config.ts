import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  booleanProp: true,
  defineProp: {
    edition: 'johnsonEdition',
  },
  defineStyleX: true,
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
