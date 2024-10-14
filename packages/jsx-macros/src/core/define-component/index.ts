import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
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
        const prop =
          parent.property.type === 'Identifier'
            ? parent.property.name
            : parent.property.type === 'StringLiteral'
              ? parent.property.value
              : ''
        if (prop) walkedIds.add(prop)
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

  const props: Record<string, string | null> = {}
  if (root.params[0]) {
    if (root.params[0].type === 'Identifier') {
      getWalkedIds(root, propsName).forEach((id) => (props[id] = null))
    } else {
      for (const prop of restructure(s, root)) {
        if (prop.path.endsWith('props')) {
          if (prop.isRest) {
            getWalkedIds(root, prop.name).forEach((id) => (props[id] = null))
          } else {
            props[prop.name] = prop.isRequired ? '{ required: true }' : null
          }
        }
      }
    }
  }

  for (const { expression, modelName, isRequired } of map.defineModel || []) {
    const name = camelize(
      expression.arguments[0]?.type === 'StringLiteral'
        ? expression.arguments[0].value
        : modelName,
    )
    const modelOptions =
      expression.arguments[0]?.type === 'ObjectExpression'
        ? expression.arguments[0]
        : expression.arguments[1]?.type === 'ObjectExpression'
          ? expression.arguments[1]
          : undefined
    const options: any = {}
    if (isRequired) options.required = true
    for (const prop of modelOptions?.properties || []) {
      if (
        prop.type === 'ObjectProperty' &&
        prop.key.type === 'Identifier' &&
        ['validator', 'type', 'required'].includes(prop.key.name)
      ) {
        options[prop.key.name] = s.sliceNode(prop.value)
      }
    }
    props[name] = Object.keys(options).length
      ? `{ ${Object.entries(options)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')} }`
      : null
    props[`'onUpdate:${name}'`] = null
  }

  const propsString = Object.entries(props)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
  if (propsString) {
    const argument = map.defineComponent.arguments[1]
    if (!argument) {
      s.appendRight(root.end!, `, { props: { ${propsString} } }`)
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
          !argument.extra?.trailingComma && argument.properties.length
            ? ','
            : ''
        } props: { ${propsString} }`,
      )
    }
  }

  // Auto add `() => ` for return statement
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
