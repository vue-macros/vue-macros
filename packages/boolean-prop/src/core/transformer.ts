import type {
  ConstantTypes,
  NodeTransform,
  NodeTypes,
} from '@vue/compiler-core'

export interface Options {
  /**
   * @default '!'
   */
  prefix?: string
}

export function transformBooleanProp(
  options: Options = { prefix: '!' },
): NodeTransform {
  return (node) => {
    if (node.type !== (1 satisfies NodeTypes.ELEMENT)) return
    for (const [i, prop] of node.props.entries()) {
      if (
        prop.type !== (6 satisfies NodeTypes.ATTRIBUTE) ||
        prop.value !== undefined
      )
        continue

      let { prefix } = options
      prefix ||= '!'
      if (prop.name.slice(0, 1) === prefix) {
        const propName = prop.name.slice(1)
        node.props[i] = {
          type: 7 satisfies NodeTypes.DIRECTIVE,
          name: 'bind',
          arg: {
            type: 4 satisfies NodeTypes.SIMPLE_EXPRESSION,
            constType: 3 satisfies ConstantTypes.CAN_STRINGIFY,
            content: propName,
            isStatic: true,
            loc: prop.loc,
          },
          exp: {
            type: 4 satisfies NodeTypes.SIMPLE_EXPRESSION,
            constType: 3 satisfies ConstantTypes.CAN_STRINGIFY,
            content: 'false',
            isStatic: false,
            loc: prop.loc,
          },
          loc: prop.loc,
          modifiers: [],
        }
      } else {
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
}
