import { isDeclarationType } from '@vue-macros/common'
import type { Declaration, TypeScript } from '@babel/types'

export type TSDeclaration = TypeScript & Declaration
export function isTSDeclaration(node: any): node is TSDeclaration {
  return isDeclarationType(node) && node.type.startsWith('TS')
}
