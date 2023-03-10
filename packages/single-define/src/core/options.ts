import { type MagicString } from '@vue-macros/common'
import type { Node } from '@babel/types'

export interface TransformOptions {
  id: string
  code: string
  magicString: MagicString
  offset: number
  setupAst: Node
}
