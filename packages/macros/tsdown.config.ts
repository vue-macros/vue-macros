import { config } from '../../tsdown.config.js'

export default config({
  ignoreDeps: [
    // Used in dts
    '@vue-macros/common',
  ],
})
