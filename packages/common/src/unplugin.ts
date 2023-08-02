import {
  type FilterPattern,
  createFilter as createRollupFilter,
} from '@rollup/pluginutils'

export interface BaseOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  version?: number
}

export function createFilter(options: BaseOptions) {
  return createRollupFilter(options.include, options.exclude)
}

export { normalizePath } from '@rollup/pluginutils'
