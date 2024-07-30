import type { Options } from './options'

export function defineConfig(
  config: Omit<Options, 'plugins'>,
): Omit<Options, 'plugins'> {
  return config
}
