import {
  type FilterPattern,
  createFilter as createRollupFilter,
} from '@rollup/pluginutils'
import { generateTransform } from 'magic-string-ast'

/** @deprecated use `generateTransform` instead */
export const getTransformResult = generateTransform

export interface BaseOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  version?: number
}

export function createFilter(options: BaseOptions) {
  return createRollupFilter(options.include, options.exclude)
}

export { normalizePath } from '@rollup/pluginutils'
