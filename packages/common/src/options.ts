import type { FilterOptions } from './unplugin'

export interface BaseOptions extends FilterOptions {
  version?: number
  isProduction?: boolean
}
