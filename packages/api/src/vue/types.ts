import type { Node, TSModuleBlock } from '@babel/types'
import type { TSFile, TSResolvedType } from '../ts'

export enum DefinitionKind {
  /**
   * Definition is a referenced variable.
   *
   * @example defineSomething(foo)
   */
  Reference = 'Reference',
  /**
   * Definition is a `ObjectExpression`.
   *
   * @example defineSomething({ ... })
   */
  Object = 'Object',
  /**
   * Definition is TypeScript interface.
   *
   * @example defineSomething<{ ... }>()
   */
  TS = 'TS',
}

export interface ASTDefinition<T extends Node> {
  code: string
  scope: TSFile | TSResolvedType<TSModuleBlock> | undefined
  ast: T
}
