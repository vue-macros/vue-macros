import { config } from '../../tsdown.config.js'

export default config({
  shims: true,
  ignoreDeps: ['vue'],
  platform: 'node',
})
