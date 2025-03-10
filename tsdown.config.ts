import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Options } from 'tsdown'
import Macros from 'unplugin-macros/rolldown'
import Quansync from 'unplugin-quansync/rolldown'
import Raw from 'unplugin-raw/rolldown'
import type { ModuleResolutionKind } from 'typescript'
import type { Options as UnusedOptions } from 'unplugin-unused'

const filename = fileURLToPath(import.meta.url)
const macros = path.resolve(filename, '../macros')

export function config({
  onlyIndex = false,
  platform = 'neutral',
  external = [],
  shims,
  ignoreDeps = { peerDependencies: ['vue'] },
  onSuccess,
}: {
  onlyIndex?: boolean
  platform?: Options['platform']
  external?: string[]
  shims?: boolean
  ignoreDeps?: UnusedOptions['ignore']
  onSuccess?: Options['onSuccess']
} = {}): Options {
  const entry = onlyIndex ? ['./src/index.ts'] : ['./src/*.ts', '!./**.d.ts']

  return {
    entry,
    format: 'esm',
    target: 'node20.18',
    watch: !!process.env.DEV,
    dts: {
      exclude: [/node_modules/, `${macros}/**`],
    },
    bundleDts: {
      compilerOptions: {
        moduleResolution: 100 satisfies ModuleResolutionKind.Bundler,
      },
    },
    clean: true,
    define: {
      'import.meta.DEV': JSON.stringify(!!process.env.DEV),
    },
    shims,
    platform,
    external,
    unused: {
      ignore: ignoreDeps,
      level: 'error',
    },

    plugins: [
      Quansync(),
      Raw({
        transform: {
          options: { minifyWhitespace: true },
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

    onSuccess,
  }
}

export default defineConfig(config())
