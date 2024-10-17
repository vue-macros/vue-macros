import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import { walkIdentifiers } from 'vue/compiler-sfc'
import { getParamsStart, type FunctionalNode } from '..'
import type { CallExpression, Node } from '@babel/types'

export function transformReactDefineExpose(
  node: CallExpression,
  root: FunctionalNode,
  s: MagicStringAST,
  lib: string,
): void {
  if (root.type === 'FunctionDeclaration' && root.id) {
    s.prependLeft(root.start!, `const ${s.sliceNode(root.id)} = `)
  }
  s.appendLeft(
    root.start!,
    `${importHelperFn(s, 0, 'forwardRef', lib === 'preact' ? 'preact/compat' : lib)}(`,
  )

  const refName = root.params[1]
    ? s.sliceNode(root.params[1])
    : `${HELPER_PREFIX}ref`
  if (!root.params[0]) {
    s.appendRight(getParamsStart(root, s.original), `, ${refName}`)
  } else if (!root.params[1]) {
    s.appendLeft(root.params[0].end!, `, ${refName}`)
  }

  s.overwrite(
    node.start!,
    node.arguments[0].start!,
    `${importHelperFn(s, 0, 'useImperativeHandle', lib === 'preact' ? 'preact/hooks' : lib)}(${refName}, () =>(`,
  )
  const result = new Set()
  walkIdentifiers(
    node.arguments[0],
    (id, _, parentStack, ___, isLocal) => {
      if (!isLocal) {
        let res: Node | null = id
        for (let i = parentStack.length - 1; i >= 0; i--) {
          if (
            ['MemberExpression', 'OptionalMemberExpression'].includes(
              parentStack[i].type,
            )
          ) {
            res = parentStack[i]
          } else {
            if (
              ['CallExpression', 'OptionalCallExpression'].includes(
                parentStack[i].type,
              )
            ) {
              res = null
            }
            break
          }
        }
        if (res) result.add(s.sliceNode(res))
      }
    },
    false,
  )
  s.appendRight(
    node.arguments[0].end!,
    `), ${`[${result.size ? [...result] : ''}]`}`,
  )

  s.appendRight(root.end!, `)`)
}
