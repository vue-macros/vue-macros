import { config } from '../../tsup.config.js'

export default config({
  onlyIndex: true,
  platform: 'neutral',
  shims: true,
  external: ['node:module'],
})
