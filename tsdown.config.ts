import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import glob from 'fast-glob'
import Macros from 'unplugin-macros/rolldown'
import Quansync from 'unplugin-quansync/rolldown'
import Raw from 'unplugin-raw/rolldown'
import type { UserConfig } from 'tsdown/config'
import type { Options as UnusedOptions } from 'unplugin-unused'

export interface BuildConfig {
  onlyIndex?: boolean
  platform?: 'node' | 'neutral' | 'browser'
  external?: string[]
  ignoreDeps?: UnusedOptions['ignore']
  cwd?: string
}

export function defineBuildConfig(config?: BuildConfig) {
  return config
}

async function main() {
  const files = await glob(['packages/*/tsdown.config.ts'], {
    cwd: import.meta.dirname,
    absolute: true,
  })
  const configs: BuildConfig[] = await Promise.all(
    files.map(async (file) => {
      const mod: any = await import(pathToFileURL(file).href)
      return {
        ...(mod.default || {}),
        cwd: path.dirname(file),
      }
    }),
  )

  return configs.map(
    ({ onlyIndex, platform, external, ignoreDeps, cwd }): UserConfig => {
      const entry = onlyIndex
        ? ['./src/index.ts']
        : ['./src/*.ts', '!./**.d.ts']

      return {
        entry,
        format: 'esm',
        target: 'node20.18',
        watch: !!process.env.DEV,
        dts: { isolatedDeclarations: true },
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
        cwd,
        outDir: path.resolve(cwd!, 'dist'),
        report: false,

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
                  '#macros': path.resolve(
                    import.meta.filename,
                    '../macros/index.ts',
                  ),
                },
              },
            },
          }),
        ],
      }
    },
  )
}

export default main
