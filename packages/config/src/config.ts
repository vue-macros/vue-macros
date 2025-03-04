import { quansync, type QuansyncFn } from 'quansync/macro'
import { loadConfig as _loadConfig } from 'unconfig'
import type { Options } from './options'

export const loadConfig: QuansyncFn<Options, [cwd: string]> = quansync(
  async (cwd: string) => {
    const { config } = await _loadConfig<Options>({
      sources: [
        {
          files: 'vue-macros.config',
          extensions: ['mts', 'cts', 'ts', 'mjs', 'cjs', 'js', 'json', ''],
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
    return config
  },
)
