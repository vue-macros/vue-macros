import type { Node, Statement, TSType } from '@babel/types'

export interface ComponentInfo {
  options: string
  props?: Record<string, undefined | string>
  emits?: Record<string, undefined | string>
  expose?: string[]
}

export interface MacroContext {
  id: string
  code: string
  component: ComponentInfo

  statement: Statement
  args: Node[]
  typeArgs: TSType[]

  snipNode: (node: Node) => string
}

export interface Macro {
  name: string
  processor: (ctx: MacroContext) => ComponentInfo
  runtime?: [string, string]
}
