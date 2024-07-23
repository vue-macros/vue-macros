import {
  ConstantTypes,
  createSimpleExpression,
  NodeTypes,
  processExpression,
  type NodeTransform,
} from '@vue/compiler-core'

export interface Options {
  version?: number
}

export function transformShortBind(options: Options = {}): NodeTransform {
  const version = options.version || 3.3
  const reg = new RegExp(
    `^(::${version < 3.4 ? '?' : ''}|\\$|\\*)(?=[A-Z_])`,
    'i',
  )

  return (node, context) => {
    if (node.type !== NodeTypes.ELEMENT) return

    for (const prop of node.props) {
      if (
        reg.test(prop.loc.source) &&
        (prop.type === NodeTypes.ATTRIBUTE
          ? !prop.value
          : prop.type === NodeTypes.DIRECTIVE
            ? !prop.exp
            : false)
      ) {
        const valueName = prop.loc.source
          .replace(reg, '')
          .replaceAll(/-([A-Z])/gi, (_, name) => name.toUpperCase())

        if (prop.type === NodeTypes.ATTRIBUTE) {
          prop.value = {
            type: NodeTypes.TEXT,
            content: valueName,
            loc: {
              start: { ...prop.loc.start },
              end: prop.loc.end,
              source: `"${valueName}"`,
            },
          }
          prop.loc.start.offset = Number.POSITIVE_INFINITY
        } else if (prop.type === NodeTypes.DIRECTIVE) {
          const simpleExpression = createSimpleExpression(
            valueName,
            false,
            {
              start: {
                offset:
                  prop.loc.start.offset +
                  (prop.loc.source.startsWith('::') ? 2 : 1),
                column: prop.loc.start.column,
                line: prop.loc.start.line,
              },
              end: {
                offset: prop.loc.end.offset,
                column: prop.loc.end.column,
                line: prop.loc.end.line,
              },
              source: valueName,
            },
            ConstantTypes.NOT_CONSTANT,
          )

          if (prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION)
            prop.arg.loc.start.offset = Number.POSITIVE_INFINITY

          prop.exp = processExpression(simpleExpression, context)
        }
      }
    }
  }
}
