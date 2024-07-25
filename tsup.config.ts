import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'
import { createUnplugin } from 'unplugin'
import { IsolatedDecl } from 'unplugin-isolated-decl'
import Macros from 'unplugin-macros'
import Raw from 'unplugin-raw/esbuild'

const filename = fileURLToPath(import.meta.url)
const macros = path.resolve(filename, '../macros')

export default defineConfig({
  entry: ['./src/*.ts', '!./**.d.ts'],
  format: ['cjs', 'esm'],
  target: 'node16.14',
  splitting: true,
  cjsInterop: true,
  watch: !!process.env.DEV,
  dts: false,
  tsconfig: '../../tsconfig.lib.json',
  clean: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
  removeNodeProtocol: false,
  esbuildPlugins: [
    createUnplugin<undefined, true>((opt, meta) => {
      return [
        IsolatedDecl.raw({ exclude: [/node_modules/, `${macros}/**`] }, meta),
        Macros.raw(
          {
            viteConfig: {
              resolve: {
                alias: {
                  '#macros': path.resolve(filename, '../macros/index.ts'),
                },
              },
            },
          },
          meta,
        ),
      ]
    }).esbuild(),
    Raw({
      transform: {
        options: {
          minifyWhitespace: true,
        },
      },
    }),
  ],
})
