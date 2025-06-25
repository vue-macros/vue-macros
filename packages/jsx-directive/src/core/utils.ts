import type { Node } from '@babel/types'
import type { MagicString } from '@vue-macros/common'

const replaceRangeMap = new WeakMap<
  MagicString,
  {
    [key: string]: {
      usedNodes: Partial<Node>[]
      offsets: { [key: string]: number }
    }
  }
>()

export function replaceRange(
  s: MagicString,
  start: number,
  end: number,
  ...nodes: (string | Partial<Node>)[]
): MagicString {
  const map = replaceRangeMap.get(s) ?? replaceRangeMap.set(s, {}).get(s)!
  const { usedNodes, offsets } =
    map[s.offset] ?? (map[s.offset] = { usedNodes: [], offsets: {} })

  if (nodes.length) {
    let index = offsets[start] || 0
    let intro = ''
    let prevNode
    for (const node of nodes) {
      if (typeof node === 'string') {
        node && (intro += node)
      } else {
        s.move(node.start!, node.end!, start)
        index = node.start!
        prevNode = node
        if (intro) {
          s.appendRight(index, intro)
          intro = ''
        }
        usedNodes.push(node)
      }
    }
    if (intro) {
      s.appendLeft(prevNode?.end || start, intro)
    }
    offsets[start] = index
  }

  if (end > start) {
    let index = start
    usedNodes
      .filter((node) => node.start! >= start && node.end! <= end)
      .sort((a, b) => a.start! - b.start!)
      .forEach((node) => {
        if (node.start! > index) {
          s.remove(index, node.start!)
        }
        index = node.end!
      })
    s.remove(index, end)
  }
  return s
}
