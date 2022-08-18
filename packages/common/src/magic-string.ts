import MagicStringBase from 'magic-string'
import type { OverwriteOptions } from 'magic-string'
import type { Node } from '@babel/types'

export class MagicString extends MagicStringBase {
  removeNode(node: Node, offset = 0) {
    this.remove(offset + node.start!, offset + node.end!)
    return this
  }

  moveNode(node: Node, index: number, offset = 0) {
    this.move(offset + node.start!, offset + node.end!, index)
    return this
  }

  sliceNode(node: Node, offset = 0) {
    return this.slice(offset + node.start!, offset + node.end!)
  }

  overwriteNode(
    node: Node,
    content: string | Node,
    { offset = 0, ...options }: OverwriteOptions & { offset?: number } = {}
  ) {
    const _content =
      typeof content === 'string' ? content : this.sliceNode(content)
    this.overwrite(offset + node.start!, offset + node.end!, _content, options)
    return this
  }
}
