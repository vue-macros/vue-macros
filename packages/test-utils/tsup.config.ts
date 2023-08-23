import { defineConfig } from 'tsup'
import cfg from '../../tsup.config.js'

export default defineConfig({
  ...cfg,
  entry: ['./src/index.ts'],
  splitting: false,
})
