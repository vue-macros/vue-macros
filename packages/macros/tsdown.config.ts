import { defineConfig } from 'tsdown/config'

export default defineConfig({
  unused: {
    ignore: [
      // Used in dts
      '@vue-macros/common',
    ],
  },
})
