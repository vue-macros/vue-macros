import type { Options } from './options'

export async function loadConfigAsync(cwd: string): Promise<Options> {
  const { loadConfig } = await import('unconfig')
  const { config } = await loadConfig<Options>({
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
  delete config.plugins
  return config
}
