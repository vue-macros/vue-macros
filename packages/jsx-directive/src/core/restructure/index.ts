import {
  babelParse,
  HELPER_PREFIX,
  importHelperFn,
  MagicStringAST,
  walkAST,
  type MagicString,
} from '@vue-macros/common'
import { walkIdentifiers } from '@vue/compiler-core'
import { withDefaultsHelperId } from '../helper'
import type {
  ArrowFunctionExpression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from '@babel/types'

type FunctionalNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression

type Prop = {
  path: string
  name: string
  value: string
  defaultValue?: string
  isRest?: boolean
  isRequired?: boolean
}

type Options = {
  withDefaultsFrom?: string
  generateRestProps?: (
    restPropsName: string,
    index: number,
    list: Prop[],
  ) => string | undefined
  unwrapRef?: boolean
}

export function restructure(
  s: MagicString,
  node: FunctionalNode,
  options?: Options,
): Prop[] {
  let index = 0
  const propList: Prop[] = []
  for (const param of node.params) {
    const path = `${HELPER_PREFIX}props${index++ || ''}`
    const props = getProps(param, path, s, [], options)
    if (props) {
      const hasDefaultValue = props.some((i) => i.defaultValue)
      s.overwrite(param.start!, param.end!, path)
      propList.push(
        ...(hasDefaultValue
          ? props.map((i) => ({
              ...i,
              path: i.path.replace(HELPER_PREFIX, `${HELPER_PREFIX}default_`),
            }))
          : props),
      )
    }
  }

  if (propList.length) {
    const defaultValues: Record<string, Prop[]> = {}
    const rests = []
    for (const prop of propList) {
      if (prop.defaultValue) {
        const basePath = prop.path.split(/\.|\[/)[0]
        ;(defaultValues[basePath] ??= []).push(prop)
      }
      if (prop.isRest) {
        rests.push(prop)
      }
    }
    for (const [path, values] of Object.entries(defaultValues)) {
      const createPropsDefaultProxy = importHelperFn(
        s,
        0,
        'createPropsDefaultProxy',
        options?.withDefaultsFrom || withDefaultsHelperId,
      )
      const resolvedPath = path.replace(
        `${HELPER_PREFIX}default_`,
        HELPER_PREFIX,
      )
      const resolvedValues = values
        .map(
          (i) => `'${i.path.replace(path, '')}${i.value}': ${i.defaultValue}`,
        )
        .join(', ')
      prependFunctionalNode(
        node,
        s,
        `\nconst ${path} = ${createPropsDefaultProxy}(${resolvedPath}, {${resolvedValues}})`,
      )
    }

    for (const [index, rest] of rests.entries()) {
      prependFunctionalNode(
        node,
        s,
        options?.generateRestProps?.(rest.name, index, rests) ??
          `\nconst ${rest.name} = ${importHelperFn(
            s,
            0,
            'createPropsRestProxy',
            'vue',
          )}(${rest.path}, [${rest.value}])`,
      )
    }

    walkIdentifiers(
      node.body,
      (id, parent) => {
        const prop = propList.find((i) => i.name === id.name)
        if (prop && !prop.isRest) {
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

  return propList
}

function getProps(
  node: Node,
  path: string = '',
  s: MagicString,
  props: Prop[] = [],
  options?: Options,
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
    const value = `[${index}]${options?.unwrapRef ? '.value' : ''}`
    if (prop?.type === 'Identifier') {
      // { foo }
      props.push({ name: prop.name, path, value })
      propNames.push(`'${prop.name}'`)
    } else if (
      prop?.type === 'AssignmentPattern' &&
      prop.left.type === 'Identifier'
    ) {
      // [foo = 'foo']
      props.push({
        path,
        name: prop.left.name,
        value,
        defaultValue: s.slice(prop.right.start!, prop.right.end!),
      })
      propNames.push(`'${prop.left.name}'`)
    } else if (
      prop?.type === 'ObjectProperty' &&
      prop.key.type === 'Identifier'
    ) {
      if (
        prop.value.type === 'AssignmentPattern' &&
        prop.value.left.type === 'Identifier'
      ) {
        // { foo: bar = 'foo' }
        props.push({
          path,
          name: prop.value.left.name,
          value: `.${prop.key.name}`,
          defaultValue: s.slice(prop.value.right.start!, prop.value.right.end!),
          isRequired: prop.value.right.type === 'TSNonNullExpression',
        })
      } else if (
        !getProps(prop.value, `${path}.${prop.key.name}`, s, props, options)
      ) {
        // { foo: bar }
        props.push({
          path,
          name:
            prop.value.type === 'Identifier' ? prop.value.name : prop.key.name,
          value: `.${prop.key.name}`,
        })
      }
      propNames.push(`'${prop.key.name}'`)
    } else if (
      prop?.type === 'RestElement' &&
      prop.argument.type === 'Identifier' &&
      !prop.argument.name.startsWith(`${HELPER_PREFIX}props`)
    ) {
      // { ...rest }
      props.push({
        path,
        name: prop.argument.name,
        value: propNames.join(', '),
        isRest: true,
      })
    } else if (prop) {
      getProps(prop, `${path}${value}`, s, props, options)
    }
  })
  return props.length ? props : undefined
}

function prependFunctionalNode(
  node: FunctionalNode,
  s: MagicString,
  result: string,
): void {
  const isBlockStatement = node.body.type === 'BlockStatement'
  const start = node.body.extra?.parenthesized
    ? (node.body.extra.parenStart as number)
    : node.body.start!
  s.appendRight(
    start + (isBlockStatement ? 1 : 0),
    `${result};${!isBlockStatement ? 'return ' : ''}`,
  )
  if (!isBlockStatement) {
    s.appendLeft(start, '{')
    s.appendRight(node.end!, '}')
  }
}

export const transformRestructure = (
  code: string,
  options?: Options,
): string => {
  const s = new MagicStringAST(code)
  const ast = babelParse(code, 'tsx')
  walkAST<Node>(ast, {
    enter(node) {
      if (
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionDeclaration'
      ) {
        restructure(s, node, options)
      }
    },
  })
  return s.toString()
}
