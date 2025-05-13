import { defineConfig } from 'tsdown/config'

export default defineConfig({
  unused: {
    ignore: {
      peerDependencies: ['vue', '@vue-macros/reactivity-transform'],
    },
  },
})
