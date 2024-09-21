import type { FunctionalNode } from '..'
import { transformReactDefineExpose } from './react'
import { transformVueDefineExpose } from './vue'
import type { CallExpression } from '@babel/types'
import type { MagicStringAST } from '@vue-macros/common'

export { transformVueDefineExpose } from './vue'
export { transformReactDefineExpose } from './react'

export function transformDefineExpose(
  node: CallExpression,
  root: FunctionalNode,
  s: MagicStringAST,
  lib: string,
): void {
  if (lib.includes('vue')) {
    transformVueDefineExpose(node, s, lib)
  } else if (lib.includes('react')) {
    transformReactDefineExpose(node, root, s, lib)
  }
}
