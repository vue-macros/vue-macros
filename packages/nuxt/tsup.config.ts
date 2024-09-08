import { config } from '../../tsup.config.js'

export default config({
  onlyIndex: true,
  ignoreDeps: ['nuxt'],
})
