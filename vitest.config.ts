import path from 'node:path'
import { defineConfig } from 'vitest/config'
import Macros from 'unplugin-macros/vite'

export default defineConfig({
  resolve: {
    alias: {
      '#macros': path.resolve(__dirname, 'macros/index.ts'),
    },
    conditions: ['dev'],
  },
  test: {
    threads: false,
  },
  // @ts-expect-error vite 5
  plugins: [Macros()],
})
