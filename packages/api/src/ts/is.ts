import { type Declaration, type TypeScript, isDeclaration } from '@babel/types'

export type TSDeclaration = TypeScript & Declaration
export function isTSDeclaration(node: any): node is TSDeclaration {
  return isDeclaration(node) && node.type.startsWith('TS')
}
