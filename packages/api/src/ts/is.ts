import {
  type TSDeclareFunction,
  type TSEnumDeclaration,
  type TSInterfaceDeclaration,
  type TSModuleDeclaration,
  type TSTypeAliasDeclaration,
  isDeclaration,
} from '@babel/types'

export type TSDeclaration =
  /* TypeScript & Declaration */
  | TSDeclareFunction
  | TSInterfaceDeclaration
  | TSTypeAliasDeclaration
  | TSEnumDeclaration
  | TSModuleDeclaration

export function isTSDeclaration(node: any): node is TSDeclaration {
  return isDeclaration(node) && node.type.startsWith('TS')
}
