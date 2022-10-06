import { createSimpleExpression, processExpression } from '@vue/compiler-core'
import type {
  ComponentNode,
  NodeTransform,
  PlainElementNode,
  SlotOutletNode,
  TemplateNode,
  TransformContext,
} from '@vue/compiler-core'

export type Prefix = '::' | '$' | '*'
export interface Options {
  /**
   * Support :: only currently.
   *
   * @default '::'
   */
  prefix?: Prefix
}

type NodeElement =
  | PlainElementNode
  | ComponentNode
  | SlotOutletNode
  | TemplateNode

export const transformShortVmodel = ({
  prefix = '::',
}: Options = {}): NodeTransform => {
  return (node, context) => {
    if (node.type !== 1 /* NodeTypes.ELEMENT */) return
    if (prefix === '::') processDirective(node)
    else processAttribute(prefix, node, context)
  }
}

const processDirective = (node: NodeElement) => {
  for (const [i, prop] of node.props.entries()) {
    if (
      !(
        prop.type === 7 /* NodeTypes.DIRECTIVE */ &&
        prop.arg?.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ &&
        prop.arg.content.startsWith(':')
      )
    )
      continue

    const argName = prop.arg.content.slice(1)
    node.props[i] = {
      ...prop,
      name: 'model',
      arg:
        argName.length > 0
          ? { ...prop.arg, content: prop.arg.content.slice(1) }
          : undefined,
    }
  }
}

const processAttribute = (
  prefix: string,
  node: NodeElement,
  context: TransformContext
) => {
  for (const [i, prop] of node.props.entries()) {
    if (
      !(
        prop.type === 6 /* NodeTypes.ATTRIBUTE */ &&
        prop.name.startsWith(prefix) &&
        prop.value
      )
    )
      continue

    const simpleExpression = createSimpleExpression(
      prop.value.content,
      false,
      prop.loc,
      0 /* ConstantTypes.NOT_CONSTANT */
    )
    const exp = processExpression(simpleExpression, context)

    const argName = prop.name.slice(prefix.length)
    node.props[i] = {
      type: 7 /* NodeTypes.DIRECTIVE */,
      name: 'model',
      arg:
        argName.length > 0
          ? {
              type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
              content: argName,
              constType: 3 /* ConstantTypes.CAN_STRINGIFY */,
              isStatic: true,
              loc: node.loc,
            }
          : undefined,
      exp,
      modifiers: [],
      loc: prop.loc,
    }
  }
}
