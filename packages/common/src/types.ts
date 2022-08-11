import type { SFCCompiled } from './vue'
import type { MagicString } from 'vue/compiler-sfc'

export interface TransformContext {
  code: string
  id: string

  s: MagicString
  sfc: SFCCompiled

  scriptCode: {
    prepend: string
    append: string
  }
}
