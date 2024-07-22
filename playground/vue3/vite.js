// @ts-check

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Macros from 'unplugin-macros/vite'
import Raw from 'unplugin-raw/vite'
import { startVite } from 'vite-hyper-config'

const dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))
const projectRoot = path.resolve(dirname, '../..')

startVite(undefined, {
  resolve: {
    alias: {
      '#macros': path.resolve(projectRoot, 'macros/index.ts'),
    },
    mainFields: ['main'],
    conditions: ['dev'],
  },
  define: {
    'import.meta.DEV': 'true',
  },
  plugins: [Macros(), Raw()],
})
