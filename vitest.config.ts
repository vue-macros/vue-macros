import process from 'node:process'
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import Macros from 'unplugin-macros/vite'

export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
    setupFiles: ['./vitest-setup.ts'],
  },
  resolve: {
    alias: {
      '#macros': path.resolve(__dirname, 'macros/index.ts'),
    },
    conditions: ['dev'],
  },
  plugins: [Macros()],
})
