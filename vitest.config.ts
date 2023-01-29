import { defineConfig } from 'vitest/config'
import esbuild from 'rollup-plugin-esbuild'

export default defineConfig(() => {
  return {
    resolve: {
      conditions: ['dev'],
    },
    plugins: [
      process.version.startsWith('v14')
        ? esbuild({
            target: 'node14',
          })
        : [],
    ],
  }
})
