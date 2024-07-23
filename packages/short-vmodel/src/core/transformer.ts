import {
  ConstantTypes,
  createSimpleExpression,
  NodeTypes,
  processExpression,
  type ComponentNode,
  type ExpressionNode,
  type NodeTransform,
  type PlainElementNode,
  type SlotOutletNode,
  type TemplateNode,
  type TransformContext,
} from '@vue/compiler-core'

export type Prefix = '::' | '$' | '*'
export interface Options {
  /**
   * @default '$'
   */
  prefix?: Prefix
}

type NodeElement =
  | PlainElementNode
  | ComponentNode
  | SlotOutletNode
  | TemplateNode

export function transformShortVmodel({
  prefix = '$',
}: Options = {}): NodeTransform {
  return (node, context) => {
    if (node.type !== NodeTypes.ELEMENT) return
    if (prefix === '::') processDirective(node)
    else processAttribute(prefix, node, context)
  }
}

export function processDirective(node: NodeElement): void {
  for (const [i, prop] of node.props.entries()) {
    if (
      !(
        prop.type === NodeTypes.DIRECTIVE &&
        prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
        prop.arg.content.startsWith(':')
      )
    )
      continue

    // remove `:` for `::` prefix
    prop.arg.loc.start.offset += 1

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

export function processAttribute(
  prefix: string,
  node: NodeElement,
  context: TransformContext,
): void {
  for (const [i, prop] of node.props.entries()) {
    if (
      !(
        prop.type === NodeTypes.ATTRIBUTE &&
        prop.name.startsWith(prefix) &&
        prop.value
      )
    )
      continue

    const expLoc = prop.value.loc
    {
      // remove "
      expLoc.start.offset++
      expLoc.start.column++
      expLoc.end.offset--
      expLoc.end.column--
      expLoc.source = expLoc.source.slice(1, -1)
    }
    const simpleExpression = createSimpleExpression(
      prop.value.content,
      false,
      expLoc,
      ConstantTypes.NOT_CONSTANT,
    )
    const exp = processExpression(simpleExpression, context)

    const argName = prop.name.slice(prefix.length)
    const arg: ExpressionNode | undefined =
      argName.length > 0
        ? {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: argName,
            constType: ConstantTypes.CAN_STRINGIFY,
            isStatic: true,
            loc: {
              source: argName,
              start: {
                offset: prop.loc.start.offset + prefix.length,
                column: prop.loc.start.column,
                line: prop.loc.start.line,
              },
              end: {
                offset: prop.loc.start.offset + prefix.length + argName.length,
                column: prop.loc.start.column,
                line: prop.loc.start.line,
              },
            },
          }
        : undefined

    node.props[i] = {
      type: NodeTypes.DIRECTIVE,
      name: 'model',
      arg,
      exp,
      modifiers: [],
      loc: prop.loc,
    }
  }
}
