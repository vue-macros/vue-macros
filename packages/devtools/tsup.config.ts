import { config } from '../../tsup.config.js'

export default config({
  shims: true,
  treeshake: true,
  ignoreDeps: ['vue'],
})
