import { config } from '../../tsdown.config.js'

export default config({
  ignoreDeps: {
    peerDependencies: ['vue', '@vue-macros/reactivity-transform'],
  },
})
