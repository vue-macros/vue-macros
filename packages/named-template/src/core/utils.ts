import { type ElementNode } from '@vue/compiler-dom'

export function getChildrenLocation(
  node: ElementNode
): [number, number] | undefined {
  if (node.children.length > 0) {
    const lastChild = node.children.at(-1)
    return [node.children[0].loc.start.offset, lastChild.loc.end.offset]
  } else {
    return undefined
  }
}

export interface VueQuery {
  vue?: boolean
  src?: string
  type?: 'script' | 'template' | 'style' | 'custom'
  index?: number
  lang?: string
  raw?: boolean
  url?: boolean
  scoped?: boolean
}

/**
 * Copy from https://github.com/vitejs/vite-plugin-vue/blob/797e424e46600c93fa76a4ef8befc08ef6b5abdb/packages/plugin-vue/src/utils/query.ts#L12
 */
export function parseVueRequest(id: string): {
  filename: string
  query: VueQuery
} {
  const [filename, rawQuery] = id.split(`?`, 2)
  const query = Object.fromEntries(new URLSearchParams(rawQuery)) as VueQuery
  if (query.vue != null) {
    query.vue = true
  }
  if (query.index != null) {
    query.index = Number(query.index)
  }
  if (query.raw != null) {
    query.raw = true
  }
  if (query.url != null) {
    query.url = true
  }
  if (query.scoped != null) {
    query.scoped = true
  }
  return {
    filename,
    query,
  }
}
