import type { FilterPattern } from '@rollup/pluginutils'

export interface VolarOptions {
  defineModels?: {
    unified?: boolean
  }
  shortVmodel?: {
    prefix?: '::' | '$' | '*'
  }
  exportExpose?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  exportProps?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  exportRender?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
}
