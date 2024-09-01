import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Options } from 'tsup'
import { createUnplugin } from 'unplugin'
import Macros from 'unplugin-macros'
import Raw from 'unplugin-raw'
import Unused from 'unplugin-unused'

const filename = fileURLToPath(import.meta.url)

export function config({
  ignoreDeps = [],
  shims,
  treeshake,
}: {
  ignoreDeps?: string[]
  shims?: boolean
  treeshake?: boolean
} = {}): Options {
  return {
    entry: ['./src/*.ts', '!./**.d.ts'],
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
              noCheck: true,
            },
          },
    tsconfig: '../../tsconfig.lib.json',
    clean: true,
    define: {
      'import.meta.DEV': JSON.stringify(!!process.env.DEV),
    },
    removeNodeProtocol: false,
    shims,
    treeshake,

    esbuildPlugins: [
      createUnplugin<undefined, true>((opt, meta) => {
        return [
          Unused.raw(
            {
              level: 'error',
              ignore: ignoreDeps,
            },
            meta,
          ),
          Raw.raw(
            {
              transform: {
                options: {
                  minifyWhitespace: true,
                },
              },
            },
            meta,
          ),
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
    ],
  }
}

export default defineConfig(config())
