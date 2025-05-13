import { config } from '../../tsdown.config.ts'

export default config({
  ignoreDeps: {
    peerDependencies: ['vue', '@vue-macros/reactivity-transform'],
  },
})
