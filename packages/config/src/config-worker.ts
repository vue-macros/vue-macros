import { readFile } from 'node:fs/promises'
import { loadConfig } from 'unconfig'
import type { Options } from './options'

export async function loadConfigAsync(cwd: string): Promise<Options> {
  const { importx } = await import('importx')
  const { config } = await loadConfig<Options>({
    sources: [
      {
        files: 'vue-macros.config',
        extensions: ['mts', 'cts', 'ts', 'mjs', 'cjs', 'js', 'json', ''],
        async parser(filepath) {
          try {
            return JSON.parse(await readFile(filepath, 'utf-8'))
          } catch {
            const result = await importx(filepath, {
              parentURL: filepath,
              cache: false,
              loader: 'jiti',
            })
            return result.default || result
          }
        },
      },
      {
        files: 'package.json',
        extensions: [],
        rewrite: (config: any) => config?.vueMacros,
      },
    ],
    defaults: {},
    cwd,
  })
  delete config.plugins
  return config
}
