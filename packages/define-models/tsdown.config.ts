import { defineBuildConfig } from '../../tsdown.config.ts'

export default defineBuildConfig({
  ignoreDeps: {
    peerDependencies: ['@vueuse/core'],
  },
})
