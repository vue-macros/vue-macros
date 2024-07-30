import {
  createSimpleExpression,
  processExpression,
  type ConstantTypes,
  type NodeTransform,
  type NodeTypes,
} from '@vue/compiler-core'

const reg = /^(::?|\$|\*)(?=[A-Z_])/i

export interface Options {
  version?: number
}

export function transformShortBind(options: Options = {}): NodeTransform {
  const version = options.version || 3.3

  return (node, context) => {
    if (node.type !== (1 satisfies NodeTypes.ELEMENT)) return

    for (const prop of node.props) {
      if (
        reg.test(prop.loc.source) &&
        (prop.type === (6 satisfies NodeTypes.ATTRIBUTE)
          ? !prop.value
          : prop.type === (7 satisfies NodeTypes.DIRECTIVE)
            ? !prop.exp
            : false)
      ) {
        let [, prefix, valueName] = prop.loc.source.split(reg)
        if (valueName) {
          valueName = valueName.replaceAll(/-([A-Z])/gi, (_, name) =>
            name.toUpperCase(),
          )
        }
        if (version >= 3.4 && prefix === ':') return

        if (prop.type === (6 satisfies NodeTypes.ATTRIBUTE)) {
          prop.value = {
            type: 2 satisfies NodeTypes.TEXT,
            content: valueName,
            loc: {
              start: { ...prop.loc.start },
              end: prop.loc.end,
              source: `"${valueName}"`,
            },
          }
          prop.loc.start.offset = Number.POSITIVE_INFINITY
        } else if (prop.type === (7 satisfies NodeTypes.DIRECTIVE)) {
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
            0 satisfies ConstantTypes.NOT_CONSTANT,
          )

          if (prop.arg?.type === (4 satisfies NodeTypes.SIMPLE_EXPRESSION))
            prop.arg.loc.start.offset = Number.POSITIVE_INFINITY

          prop.exp = processExpression(simpleExpression, context)
        }
      }
    }
  }
}
