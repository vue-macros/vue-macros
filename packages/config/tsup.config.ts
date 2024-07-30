import { defineConfig } from 'tsup'
import config from '../../tsup.config.js'

export default defineConfig({
  ...config,
  shims: true,
})
