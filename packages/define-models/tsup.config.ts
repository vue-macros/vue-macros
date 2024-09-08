import { config } from '../../tsup.config.js'

export default config({
  ignoreDeps: {
    peerDependencies: ['@vueuse/core'],
  },
})
