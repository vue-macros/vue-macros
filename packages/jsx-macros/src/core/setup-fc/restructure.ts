import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicString,
} from '@vue-macros/common'
import { walkIdentifiers } from '@vue/compiler-core'
import { withDefaultsHelperId } from '../helper'
import type { FunctionalNode } from '..'
import { prependFunctionalNode } from '.'
import type { Node } from '@babel/types'

type Prop = {
  path: string
  name: string
  value: string
  defaultValue?: string
  isRest?: boolean
}

function getProps(
  node: Node,
  path: string = '',
  s: MagicString,
  props: Prop[] = [],
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
      // { foo }
      props.push({ name: prop.name, path, value: `[${index}]` })
      propNames.push(`'${prop.name}'`)
    } else if (
      prop?.type === 'AssignmentPattern' &&
      prop.left.type === 'Identifier'
    ) {
      // [foo = 'foo']
      props.push({
        path,
        name: prop.left.name,
        value: `.${prop.left.name}`,
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
        })
      } else if (!getProps(prop.value, `${path}.${prop.key.name}`, s, props)) {
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
      getProps(prop, `${path}[${index}]`, s, props)
    }
  })
  return props.length ? props : undefined
}

export function restructure(
  s: MagicString,
  node: FunctionalNode,
  withDefaultsFrom: string = withDefaultsHelperId,
): void {
  let index = 0
  const propList: Prop[] = []
  for (const param of node.params) {
    const path = `${HELPER_PREFIX}props${index++ || ''}`
    const props = getProps(param, path, s)
    if (props) {
      const hasDefaultValue = props.some((i) => i.defaultValue)
      s.overwrite(param.start!, param.end!, path)
      propList.push(
        ...(hasDefaultValue
          ? props.map((i) => ({
              ...i,
              path: i.path.replace(HELPER_PREFIX, `${HELPER_PREFIX}defaults_`),
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
      const createDefaultPropsProxy = importHelperFn(
        s,
        0,
        'createDefaultPropsProxy',
        withDefaultsFrom,
      )
      const resolvedPath = path.replace(
        `${HELPER_PREFIX}defaults_`,
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
        `\nconst ${path} = ${createDefaultPropsProxy}(${resolvedPath}, {${resolvedValues}})`,
      )
    }

    for (const prop of rests) {
      const createPropsRestProxy = importHelperFn(
        s,
        0,
        'createPropsRestProxy',
        'vue',
      )
      prependFunctionalNode(
        node,
        s,
        `\nconst ${prop.name} = ${createPropsRestProxy}(${prop.path}, [${prop.value}])`,
      )
    }

    walkIdentifiers(
      node.body,
      (id, parent, __, ___, isLocal) => {
        const prop = propList.find((i) => i.name === id.name)
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
