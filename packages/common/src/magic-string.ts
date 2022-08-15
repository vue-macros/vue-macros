import MagicStringBase from 'magic-string'
import type { Node } from '@babel/types'

export class MagicString extends MagicStringBase {
  removeNode(node: Node) {
    this.remove(node.start!, node.end!)
    return this
  }

  sliceNode(node: Node, offset = 0) {
    return this.slice(offset + node.start!, offset + node.end!)
  }
}
