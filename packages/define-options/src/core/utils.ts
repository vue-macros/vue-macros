import { DEFINE_OPTIONS, isCallOf } from '@vue-macros/common'
import {
  type CallExpression,
  type Node,
  type ObjectExpression,
  type Statement,
} from '@babel/types'

export function filterMacro(stmts: Statement[]) {
  return stmts
    .map((raw: Node) => {
      let node = raw
      if (raw.type === 'ExpressionStatement') node = raw.expression
      return isCallOf(node, DEFINE_OPTIONS) ? node : undefined
    })
    .filter((node): node is CallExpression => !!node)
}

export function hasPropsOrEmits(node: ObjectExpression) {
  return node.properties.some(
    (prop) =>
      (prop.type === 'ObjectProperty' || prop.type === 'ObjectMethod') &&
      prop.key.type === 'Identifier' &&
      (prop.key.name === 'props' ||
        prop.key.name === 'emits' ||
        prop.key.name === 'expose' ||
        prop.key.name === 'slots')
  )
}
