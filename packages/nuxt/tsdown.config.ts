import { defineBuildConfig } from '../../tsdown.config.ts'

export default defineBuildConfig({
  onlyIndex: true,
  ignoreDeps: ['nuxt'],
})
