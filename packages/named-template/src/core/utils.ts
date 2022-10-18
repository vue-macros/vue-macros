import type { ElementNode } from '@vue/compiler-dom'

export function getChildrenLocation(
  node: ElementNode
): [number, number] | undefined {
  if (node.children.length > 0) {
    const lastChild = node.children[node.children.length - 1]
    return [node.children[0].loc.start.offset, lastChild.loc.end.offset]
  } else {
    return undefined
  }
}
