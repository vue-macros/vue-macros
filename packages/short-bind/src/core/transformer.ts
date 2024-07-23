import {
  createSimpleExpression,
  processExpression,
  type ConstantTypes,
  type NodeTransform,
  type NodeTypes,
} from '@vue/compiler-core'

const reg = /^(::?|\$|\*)(?=[A-Z_a-z])/

export interface Options {
  // empty
}

// eslint-disable-next-line unused-imports/no-unused-vars -- not be used by now
export function transformShortBind(_options: Options = {}): NodeTransform {
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
        const valueName = prop.loc.source
          .replace(reg, '')
          .replaceAll(/-([A-Za-z])/g, (_, name) => name.toUpperCase())

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
