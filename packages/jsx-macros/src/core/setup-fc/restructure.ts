import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicString,
} from '@vue-macros/common'
import { walkIdentifiers } from '@vue/compiler-core'
import type { FunctionalNode } from '..'
import type { Node } from '@babel/types'

type PropMap = Map<
  string,
  { path: string; value: string; defaultValue?: string; isRest?: boolean }
>

function collectProps(
  node: Node,
  path: string = '',
  s: MagicString,
  propMap: PropMap,
) {
  const properties =
    node.type === 'ObjectPattern'
      ? node.properties
      : node.type === 'ArrayPattern'
        ? node.elements
        : []
  if (!properties.length) return

  const propNames: string[] = []
  properties.forEach((prop, index) => {
    if (prop?.type === 'Identifier') {
      propMap.set(prop.name, { path, value: `[${index}]` })
      propNames.push(`'${prop.name}'`)
    } else if (
      prop?.type === 'AssignmentPattern' &&
      prop.left.type === 'Identifier'
    ) {
      propMap.set(prop.left.name, {
        path,
        value: `.${prop.left.name}`,
        defaultValue: s.slice(prop.right.start!, prop.right.end!),
      })
      propNames.push(`'${prop.left.name}'`)
    } else if (
      prop?.type === 'ObjectProperty' &&
      prop.key.type === 'Identifier'
    ) {
      if (prop.value.type === 'AssignmentPattern') {
        propMap.set(prop.key.name, {
          path,
          value: `.${prop.key.name}`,
          defaultValue: s.slice(prop.value.right.start!, prop.value.right.end!),
        })
      } else if (
        !collectProps(prop.value, `${path}.${prop.key.name}`, s, propMap)
      ) {
        propMap.set(prop.key.name, { path, value: `.${prop.key.name}` })
      }
      propNames.push(`'${prop.key.name}'`)
    } else if (
      prop?.type === 'RestElement' &&
      prop?.argument.type === 'Identifier'
    ) {
      propMap.set(prop.argument.name, {
        path,
        value: propNames.join(', '),
        isRest: true,
      })
    } else if (prop) {
      collectProps(prop, `${path}[${index}]`, s, propMap)
    }
  })
  return true
}

export function restructure(s: MagicString, node: FunctionalNode): void {
  let index = 0
  const propMap: PropMap = new Map()
  for (const param of node.params) {
    const path = `${HELPER_PREFIX}props${index ? index++ : ''}`
    if (collectProps(param, path, s, propMap)) {
      s.overwrite(param.start!, param.end!, path)
    }
  }

  if (propMap.size) {
    for (const [key, { path, value, defaultValue, isRest }] of propMap) {
      if (!(defaultValue || isRest)) continue

      const result = defaultValue
        ? `Object.defineProperty(${path}, '${key}', { enumerable: true, get: () => ${path}['${key}'] ?? ${defaultValue} })`
        : `const ${key} = ${importHelperFn(s, 0, 'createPropsRestProxy', 'vue')}(${path}, [${value}])`
      const isBlockStatement = node.body.type === 'BlockStatement'
      const start = node.body.extra?.parenthesized
        ? (node.body.extra.parenStart as number)
        : node.body.start!
      if (!isBlockStatement) {
        s.appendLeft(start, '{')
      }
      s.appendRight(
        start + (isBlockStatement ? 1 : 0),
        `${result};${!isBlockStatement ? 'return ' : ''}`,
      )
      if (!isBlockStatement) {
        s.appendRight(node.end! + 1, '}')
      }
    }

    walkIdentifiers(
      node.body,
      (id, parent, __, ___, isLocal) => {
        const prop = propMap.get(id.name)
        if (!isLocal && prop && !prop.isRest) {
          s.overwrite(
            id.start!,
            id.end!,
            `${
              parent?.type === 'ObjectProperty' && parent.shorthand
                ? `${id.name}: `
                : ''
            }${prop.path}${prop.value}`,
          )
        }
      },
      false,
    )
  }
}
