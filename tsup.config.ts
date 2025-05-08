import { rm } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import { rollup } from 'rollup'
import dts from 'rollup-plugin-dts'
import { defineConfig, type Format, type Options } from 'tsup'
import { createUnplugin } from 'unplugin'
import { IsolatedDecl } from 'unplugin-isolated-decl'
import Macros from 'unplugin-macros'
import { Quansync } from 'unplugin-quansync'
import Raw from 'unplugin-raw'
import { Unused, type Options as UnusedOptions } from 'unplugin-unused'

const filename = fileURLToPath(import.meta.url)
const macros = path.resolve(filename, '../macros')

export function config({
  ignoreDeps = { peerDependencies: ['vue'] },
  shims,
  treeshake,
  onlyIndex = false,
  splitting = !onlyIndex,
  platform = 'neutral',
  external = [],
  onSuccess,
}: {
  ignoreDeps?: UnusedOptions['ignore']
  shims?: boolean
  treeshake?: boolean
  splitting?: boolean
  onlyIndex?: boolean
  platform?: Options['platform']
  external?: string[]
  onSuccess?: (entries: string[]) => void | Promise<void>
} = {}): Options {
  const entry = onlyIndex ? ['./src/index.ts'] : ['./src/*.ts', '!./**.d.ts']

  const format: Format[] = ['esm']

  return {
    entry,
    format,
    target: 'node20.18',
    splitting,
    watch: !!process.env.DEV,
    dts: false,
    tsconfig: '../../tsconfig.lib.json',
    clean: true,
    define: {
      'import.meta.DEV': JSON.stringify(!!process.env.DEV),
    },
    removeNodeProtocol: false,
    shims,
    treeshake,
    platform,
    external,

    esbuildPlugins: [
      createUnplugin<undefined, true>((opt, meta) => {
        return [
          Quansync.raw({}, meta),
          Unused.raw(
            {
              level: 'error',
              ignore: ignoreDeps,
            },
            meta,
          ),
          IsolatedDecl.raw(
            {
              exclude: [/node_modules/, `${macros}/**`],
              transformer: 'oxc',
              extraOutdir: 'temp',
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

    async onSuccess() {
      const entryFiles = await fg(entry)
      const input = entryFiles.map((file) =>
        path.resolve(
          process.cwd(),
          file.replace('src', 'dist/temp').replace(/\.ts$/, '.d.ts'),
        ),
      )
      const build = await rollup({
        input,
        plugins: [dts()],
        external(id) {
          return id[0] !== '.' && !path.isAbsolute(id)
        },
      })

      await build.write({
        dir: 'dist',
        format: 'es',
        entryFileNames: (chunk) => {
          let filename = chunk.name
          if (!filename.endsWith('.d')) filename += '.d'
          return `${filename}.ts`
        },
      })

      await rm(path.resolve(process.cwd(), 'dist/temp'), { recursive: true })

      await onSuccess?.(entryFiles)
    },
  }
}

export default defineConfig(config())
