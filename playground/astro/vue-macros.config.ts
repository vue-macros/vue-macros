import { defineConfig } from 'unplugin-vue-macros'

export default defineConfig({
  shortVmodel: {
    prefix: '$',
  },
  exportExpose: {
    include: ['**/export-expose/**'],
  },
  exportProps: {
    include: ['**/export-props/**'],
  },
})
