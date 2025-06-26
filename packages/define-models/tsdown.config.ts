import { defineConfig } from 'tsdown/config'

export default defineConfig({
  unused: {
    ignore: { peerDependencies: ['@vueuse/core'] },
  },
})
