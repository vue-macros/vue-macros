import { config } from '../../tsdown.config.js'

export default config({
  onlyIndex: true,
  shims: true,
  external: ['node:module'],
})
