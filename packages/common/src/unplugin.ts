import { createFilter as createRollupFilter } from '@rollup/pluginutils'
import type { MagicStringBase } from 'magic-string-ast'
import type { FilterPattern } from '@rollup/pluginutils'

export function getTransformResult(
  s: MagicStringBase | undefined,
  id: string
): { code: string; map: any } | undefined {
  if (s?.hasChanged()) {
    return {
      code: s.toString(),
      get map() {
        return s.generateMap({
          source: id,
          includeContent: true,
          hires: true,
        })
      },
    }
  }
}

export interface BaseOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  version?: 2 | 3
}

export function createFilter(options: BaseOptions) {
  return createRollupFilter(options.include, options.exclude)
}
export {
  normalizePath,
  attachScopes,
  type AttachedScope,
} from '@rollup/pluginutils'
