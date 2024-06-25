import type * as t from '@babel/types'
import type { MagicStringAST } from '@vue-macros/common'

export type Impl = (ctx: {
  s: MagicStringAST
  offset: number
  resolveTSType: (type: t.TSType) => Promise<string[] | undefined>
}) => {
  walkCall: (node: t.CallExpression, parent?: t.Node | null) => string
  genRuntimeProps: (isProduction: boolean) => Promise<string | undefined>
}

export function stringifyArray(strs: string[]): string {
  return `[${strs.map((s) => JSON.stringify(s)).join(', ')}]`
}
