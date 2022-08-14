import path from 'node:path'
import { defineConfig } from 'vitest/config'

const pathPackages = path.resolve(__dirname, 'packages')

export default defineConfig({
  resolve: {
    alias: {
      '@vue-macros/common': path.resolve(pathPackages, 'common/src'),
      'unplugin-vue-define-options': path.resolve(
        pathPackages,
        'define-options/src'
      ),
    },
  },
})
