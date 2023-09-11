import {
  type ConstantTypes,
  type NodeTransform,
  type NodeTypes,
} from '@vue/compiler-core'

export interface Options {
  // empty
}

// eslint-disable-next-line unused-imports/no-unused-vars -- not be used by now
export function transformBooleanProp(_options: Options = {}): NodeTransform {
  return (node) => {
    if (node.type !== (1 satisfies NodeTypes.ELEMENT)) return
    for (const [i, prop] of node.props.entries()) {
      if (
        prop.type !== (6 satisfies NodeTypes.ATTRIBUTE) ||
        prop.value !== undefined
      )
        continue
      node.props[i] = {
        type: 7 satisfies NodeTypes.DIRECTIVE,
        name: 'bind',
        arg: {
          type: 4 satisfies NodeTypes.SIMPLE_EXPRESSION,
          constType: 3 satisfies ConstantTypes.CAN_STRINGIFY,
          content: prop.name,
          isStatic: true,
          loc: prop.loc,
        },
        exp: {
          type: 4 satisfies NodeTypes.SIMPLE_EXPRESSION,
          constType: 3 satisfies ConstantTypes.CAN_STRINGIFY,
          content: 'true',
          isStatic: false,
          loc: prop.loc,
        },
        loc: prop.loc,
        modifiers: [],
      }
    }
  }
}
