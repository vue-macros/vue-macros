import { config } from '../../tsdown.config.ts'

export default config({
  ignoreDeps: {
    peerDependencies: ['@vueuse/core'],
  },
})
