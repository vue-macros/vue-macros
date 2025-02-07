import { config } from '../../tsup.config.js'

export default config({
  ignoreDeps: {
    peerDependencies: ['vue', '@vue-macros/reactivity-transform'],
  },
})
