import { defineConfig } from 'tsup'
import cfg from '../common/tsup.config.js'

export default defineConfig({
  ...cfg,
  entry: ['./src/**/*.ts'],
})
