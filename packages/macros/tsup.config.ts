import { config } from '../../tsup.config.js'

export default config({
  ignoreDeps: [
    // Used in dts
    '@vue-macros/common',
  ],
})
