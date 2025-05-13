import { defineBuildConfig } from '../../tsdown.config.ts'

export default defineBuildConfig({
  ignoreDeps: {
    peerDependencies: ['vue', '@vue-macros/reactivity-transform'],
  },
})
