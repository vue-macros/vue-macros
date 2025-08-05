import { readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'tsdown/config'
import Macros from 'unplugin-macros/rolldown'
import Quansync from 'unplugin-quansync/rolldown'
import Raw from 'unplugin-raw/rolldown'

export default defineConfig({
  workspace: 'packages/*',
  entry: ['./src/*.ts', '!./**.d.ts'],
  format: 'esm',
  target: 'node20.18',
  watch: !!process.env.DEV,
  dts: { oxc: true },
  clean: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
  platform: 'neutral',
  unused: {
    level: 'error',
  },
  report: false,
  exports: {
    devExports: 'dev',
    all: true,
    async customExports(exports, { outDir }) {
      const hasRootDts = (await readdir(path.dirname(outDir))).some((file) =>
        file.endsWith('.d.ts'),
      )
      if (hasRootDts) {
        exports['./*'] = ['./*', './*.d.ts']
      }

      return exports
    },
  },
  plugins: [
    Quansync(),
    Raw({
      transform: {
        options: { minifyWhitespace: true },
      },
    }),
    Macros({
      exclude: [/node_modules/, /\.d\.ts$/],
      viteConfig: {
        resolve: {
          alias: {
            '#macros': path.resolve(import.meta.filename, '../macros/index.ts'),
          },
        },
      },
    }),
  ],
})
