import { type MagicString } from '@vue-macros/common'
import { type CallExpression, type Node, type TSType } from '@babel/types'

export type Impl = (ctx: {
  s: MagicString
  offset: number
  resolveTSType(type: TSType): Promise<string[] | undefined>
}) => {
  walkCall(node: CallExpression, parent: Node | undefined | null): string
  genRuntimeProps(isProduction: boolean): Promise<string | undefined>
}

export function stringifyArray(strs: string[]) {
  return `[${strs.map((s) => JSON.stringify(s)).join(', ')}]`
}
