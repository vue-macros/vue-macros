import {
  generateTransform,
  MagicStringAST,
  type CodeTransform,
} from '@vue-macros/common'
import { parse, type ElementNode, type NodeTypes } from '@vue/compiler-dom'

export function transformSetupBlock(
  code: string,
  id: string,
  lang?: string,
): CodeTransform | undefined {
  const s = new MagicStringAST(code)

  const node = parse(code, {
    // @ts-ignore TODO remove ignore in 3.4
    parseMode: 'sfc',
    // there are no components at SFC parsing level
    isNativeTag: () => true,
    // preserve all whitespaces
    isPreTag: () => true,
    // @ts-ignore (this has been removed in Vue 3.4)
    getTextMode: ({ tag, props }: ElementNode, parent) => {
      // all top level elements except <template> are parsed as raw text
      // containers
      if (
        (!parent && tag !== 'template') ||
        // <template lang="xxx"> should also be treated as raw text
        (tag === 'template' &&
          props.some(
            (p) =>
              p.type === (6 satisfies NodeTypes.ATTRIBUTE) &&
              p.name === 'lang' &&
              p.value &&
              p.value.content &&
              p.value.content !== 'html',
          ))
      ) {
        return 2
      } else {
        return 0
      }
    },
  })
  for (const child of node.children) {
    if (child.type === 1 && child.tag === 'setup') {
      const hasLang = child.props.some((p) => p.name === 'lang')
      let codegen = 'script setup'
      if (!hasLang && lang) {
        codegen += ` lang="${lang}"`
      }
      s.overwrite(
        child.loc.start.offset + 1 /* '<'.length */,
        child.loc.start.offset + 6 /* '<setup'.length */,
        codegen,
      )
      s.overwrite(
        child.loc.end.offset - 6 /* `setup>`.length */,
        child.loc.end.offset - 1 /* '>'.length */,
        'script',
      )
    }
  }

  return generateTransform(s, id)
}
