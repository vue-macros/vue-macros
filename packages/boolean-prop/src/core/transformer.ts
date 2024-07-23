import {
  ConstantTypes,
  NodeTypes,
  type NodeTransform,
} from '@vue/compiler-core'

export interface Options {
  /**
   * @default '!'
   */
  negativePrefix?: string
}

export function transformBooleanProp({
  negativePrefix = '!',
  constType = ConstantTypes.CAN_STRINGIFY,
}: Options & { constType?: ConstantTypes } = {}): NodeTransform {
  return (node) => {
    if (node.type !== NodeTypes.ELEMENT) return
    for (const [i, prop] of node.props.entries()) {
      if (prop.type !== NodeTypes.ATTRIBUTE || prop.value !== undefined)
        continue

      const isNegative = prop.name[0] === negativePrefix
      const propName = isNegative ? prop.name.slice(1) : prop.name
      const value = String(!isNegative)
      if (isNegative) prop.loc.start.offset++
      node.props[i] = {
        type: NodeTypes.DIRECTIVE,
        name: 'bind',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          constType: ConstantTypes.CAN_STRINGIFY,
          content: propName,
          isStatic: true,
          loc: prop.loc,
        },
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          constType,
          content: value,
          isStatic: false,
          loc: {
            start: {
              ...prop.loc.start,
              offset: prop.loc.start.offset + 1,
            },
            end: prop.loc.end,
            source: value,
          },
        },
        loc: prop.loc,
        modifiers: [],
      }
    }
  }
}
