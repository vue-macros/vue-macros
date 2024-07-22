import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'
import Macros from 'unplugin-macros/esbuild'
import Raw from 'unplugin-raw/esbuild'

const filename = fileURLToPath(import.meta.url)

export default defineConfig({
  entry: ['./src/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node16.14',
  splitting: true,
  cjsInterop: true,
  watch: !!process.env.DEV,
  dts:
    process.env.DEV || process.env.NO_DTS
      ? false
      : {
          compilerOptions: {
            composite: false,
            customConditions: [],
          },
        },
  tsconfig: '../../tsconfig.lib.json',
  clean: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
  esbuildPlugins: [
    Raw({
      transform: {
        options: {
          minifyWhitespace: true,
        },
      },
    }),
    Macros({
      viteConfig: {
        resolve: {
          alias: {
            '#macros': path.resolve(filename, '../macros/index.ts'),
          },
        },
      },
    }),
  ],
})
