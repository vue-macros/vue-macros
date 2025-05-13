import { config } from '../../tsdown.config.ts'

export default config({
  ignoreDeps: [
    // Used in dts
    '@vue-macros/common',
  ],
})
