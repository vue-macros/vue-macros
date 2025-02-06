import { config } from '../../tsup.config.js'
export default config({
  ignoreDeps: ['vue-tsc'],
  platform: 'node',
  cjs: true,
  esm: false,
})
