import { config } from '../../tsup.config.js'

export default config({
  ignoreDeps: [
    '@vue-macros/volar',

    // Used in dts
    '@vue-macros/common',
  ],
})
