import type { NodeTransform } from '@vue/compiler-core'

export interface Options {
  /** Support :: only currently. */
  prefix?: '::'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const transformShortVmodel = (options: Options = {}): NodeTransform => {
  return (node) => {
    if (node.type !== 1 /* NodeTypes.ELEMENT */) return

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
}
