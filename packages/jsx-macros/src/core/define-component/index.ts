import { importHelperFn, type MagicStringAST } from '@vue-macros/common'
import { walkIdentifiers } from '@vue/compiler-core'
import type { FunctionalNode, RootMapValue } from '..'
import { transformAwait } from './await'
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

// Auto add `() => ` for return statement
function transformReturn(root: FunctionalNode, s: MagicStringAST, lib: string) {
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
      const restructuredProps = restructure(s, root, {
        generateRestProps: (restPropsName, index, list) => {
          if (index === list.length - 1) {
            const getCurrentInstance = importHelperFn(
              s,
              0,
              'getCurrentInstance',
              'vue',
            )
            return [
              `${getCurrentInstance}().inheritAttrs=false`,
              `const ${restPropsName} = ${getCurrentInstance}().setupContext.attrs`,
            ].join(';')
          }
        },
      })
      for (const prop of restructuredProps) {
        if (prop.path.endsWith('props') && !prop.isRest) {
          props[prop.name] = prop.isRequired ? '{ required: true }' : null
        }
      }
    }
  }

  for (const { expression, isRequired } of map.defineModel || []) {
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
    const propName =
      expression.arguments[0]?.type === 'StringLiteral'
        ? expression.arguments[0].value
        : 'modelValue'
    props[`'${propName}'`] = Object.keys(options).length
      ? `{ ${Object.entries(options)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')} }`
      : null
    props[`'onUpdate:${propName}'`] = null
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

  transformAwait(root, s)
  transformReturn(root, s, lib)
}
