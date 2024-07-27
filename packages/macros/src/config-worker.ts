import { loadConfig } from 'unconfig'
import type { Options } from '.'

export async function getConfigAsync(): Promise<Options> {
  const { config } = await loadConfig<Options>({
    sources: [
      {
        files: 'vue-macros.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
      },
      {
        files: 'package.json',
        extensions: [],
        rewrite: (config: any) => config?.vueMacros,
      },
    ],
    defaults: {},
  })
  delete config.plugins
  return config
}
