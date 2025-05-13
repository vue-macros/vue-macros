import { defineBuildConfig } from '../../tsdown.config.ts'

export default defineBuildConfig({
  ignoreDeps: [
    // Used in dts
    '@vue-macros/common',
  ],
})
