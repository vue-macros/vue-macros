import { config } from '../../tsup.config.js'

export default config({
  onlyIndex: true,
  shims: true,
  external: ['node:module'],
  cjs: true,
})
