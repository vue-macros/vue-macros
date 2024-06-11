import { defineConfig } from 'tsup'
import config from '../../tsup.config.js'

export default defineConfig({
  ...config,
  entry: ['src/index.ts', 'src/flat.ts'],
})
