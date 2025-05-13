import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import Macros from 'unplugin-macros/rolldown'
import Quansync from 'unplugin-quansync/rolldown'
import Raw from 'unplugin-raw/rolldown'
import type { Options } from 'tsdown'
import type { ModuleResolutionKind } from 'typescript'
import type { Options as UnusedOptions } from 'unplugin-unused'

const filename = fileURLToPath(import.meta.url)
const macros = path.resolve(filename, '../macros')

export function config({
  onlyIndex = false,
  platform = 'neutral',
  external = [],
  ignoreDeps = { peerDependencies: ['vue'] },
  onSuccess,
}: {
  onlyIndex?: boolean
  platform?: Options['platform']
  external?: string[]
  ignoreDeps?: UnusedOptions['ignore']
  onSuccess?: Options['onSuccess']
} = {}): Options {
  const entry = onlyIndex ? ['./src/index.ts'] : ['./src/*.ts', '!./**.d.ts']

  return {
    entry,
    format: 'esm',
    target: 'node20.18',
    watch: !!process.env.DEV,
    dts: true,
    clean: true,
    define: {
      'import.meta.DEV': JSON.stringify(!!process.env.DEV),
    },
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
        exclude: [/node_modules/, /\.d\.ts$/],
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
