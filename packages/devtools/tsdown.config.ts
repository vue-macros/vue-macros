import { defineBuildConfig } from '../../tsdown.config.ts'

export default defineBuildConfig({
  ignoreDeps: ['vue'],
  platform: 'node',
})
