import { type MagicString } from '@vue-macros/common'
import type * as t from '@babel/types'

export type Impl = (ctx: {
  s: MagicString
  offset: number
  resolveTSType(type: t.TSType): Promise<string[] | undefined>
}) => {
  walkCall(
    node: t.CallExpression,
    parent: t.ParentMaps['CallExpression']
  ): string
  genRuntimeProps(isProduction: boolean): Promise<string | undefined>
}

export function stringifyArray(strs: string[]) {
  return `[${strs.map((s) => JSON.stringify(s)).join(', ')}]`
}
