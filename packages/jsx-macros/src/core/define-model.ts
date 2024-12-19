import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import type { OptionsResolved } from '..'
import { useModelHelperId } from './helper'
import type { CallExpression } from '@babel/types'

export function transformDefineModel(
  node: CallExpression,
  propsName: string,
  s: MagicStringAST,
  options: OptionsResolved,
): void {
  s.overwriteNode(
    node.callee,
    importHelperFn(
      s,
      0,
      'useModel',
      useModelHelperId,
      false,
      options.defineModel.alias[0],
    ),
  )
  s.appendRight(
    node.arguments[0]?.start || node.end! - 1,
    `${propsName}, ${
      node.arguments[0]?.type !== 'StringLiteral' ? `'modelValue',` : ''
    }`,
  )
}
