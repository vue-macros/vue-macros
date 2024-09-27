import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import { walkIdentifiers } from '@vue/compiler-core'
import { camelize } from '@vue/shared'
import type { FunctionalNode, RootMapValue } from '..'
import { restructure } from './restructure'

function getWalkedIds(root: FunctionalNode, propsName: string) {
  const walkedIds = new Set<string>()
  walkIdentifiers(
    root.body,
    (id, parent) => {
      if (
        id.name === propsName &&
        (parent?.type === 'MemberExpression' ||
          parent?.type === 'OptionalMemberExpression')
      ) {
        walkedIds.add(
          parent.property.type === 'Identifier'
            ? `'${parent.property.name}'`
            : parent.property.type === 'StringLiteral'
              ? parent.property.value
              : '',
        )
      }
    },
    false,
  )
  return walkedIds
}

export function transformDefineComponent(
  root: FunctionalNode,
  propsName: string,
  map: RootMapValue,
  s: MagicStringAST,
  lib: string,
): void {
  if (!map.defineComponent) return
  s.overwriteNode(
    map.defineComponent.callee,
    importHelperFn(s, 0, 'defineComponent', 'vue'),
  )

  let propsSet = new Set<string>()
  if (root.params[0]) {
    if (root.params[0].type === 'Identifier') {
      propsSet = getWalkedIds(root, propsName)
    } else {
      const props = restructure(s, root)
      for (const prop of props) {
        if (prop.path === `${HELPER_PREFIX}props`) {
          if (prop.isRest) {
            getWalkedIds(root, prop.name).forEach((id) => propsSet.add(id))
          } else {
            propsSet.add(`'${prop.name}'`)
          }
        }
      }
    }
  }

  for (const prop of map.defineModel || []) {
    const name = camelize(
      prop.arguments[0].type === 'StringLiteral'
        ? prop.arguments[0].value
        : 'modelValue',
    )
    propsSet.add(`'${name}'`)
    propsSet.add(`'onUpdate:${name}'`)
  }

  const result = Array.from(propsSet).filter(Boolean).join(', ')
  if (result) {
    const argument = map.defineComponent.arguments[1]
    if (!argument) {
      s.appendRight(root.end!, `, { props: [ ${result} ] }`)
    } else if (
      argument.type === 'ObjectExpression' &&
      !argument.properties?.find(
        (prop) =>
          prop.type === 'ObjectProperty' &&
          prop.key.type === 'Identifier' &&
          prop.key.name === 'props',
      )
    ) {
      s.appendLeft(
        argument.end! - 1,
        `${
          !argument.properties.length || argument.extra?.trailingComma
            ? ''
            : ','
        } props: [ ${result} ]`,
      )
    }
  }

  if (lib === 'vue') {
    if (root.body.type === 'BlockStatement') {
      const returnStatement = root.body.body.find(
        (node) => node.type === 'ReturnStatement',
      )
      if (
        returnStatement &&
        returnStatement.argument &&
        !(
          returnStatement.argument?.type === 'ArrowFunctionExpression' ||
          returnStatement.argument?.type === 'FunctionExpression'
        )
      ) {
        s.appendRight(
          returnStatement.argument.extra?.parenthesized
            ? (returnStatement.argument.extra.parenStart as number)
            : returnStatement.argument.start!,
          '() => ',
        )
      }
    } else {
      s.appendRight(
        root.body.extra?.parenthesized
          ? (root.body.extra.parenStart as number)
          : root.body.start!,
        '() => ',
      )
    }
  }
}
