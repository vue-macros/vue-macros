import type { MagicString, SFCScriptBlock } from '@vue-macros/common'
import type { Program } from '@babel/types'

export interface TransformOptions {
  id: string
  s: MagicString
  offset: number
  scriptSetup: SFCScriptBlock
  setupAst: Program
  isProduction: boolean
}
