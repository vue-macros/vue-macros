import process from 'node:process'
import path from 'node:path'
import { defineConfig } from 'tsup'
import Macros from 'unplugin-macros'
import Raw from 'unplugin-raw/esbuild'
import IsolatedDecl from 'unplugin-isolated-decl'
import { createUnplugin } from 'unplugin'

const macros = path.resolve(__dirname, 'macros')

export default defineConfig({
  entry: ['./src/*.ts'],
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
  esbuildPlugins: [
    createUnplugin<undefined, true>((opt, meta) => {
      return [
        IsolatedDecl.raw({ exclude: [/node_modules/, `${macros}/**`] }, meta),
        Macros.raw(
          {
            viteConfig: {
              resolve: {
                alias: {
                  '#macros': path.resolve(macros, 'index.ts'),
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
