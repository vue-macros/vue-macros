import { useCodeGroup, useCodeGroupItem } from '../theme/components/markdown'
import type { MarkdownOptions } from 'vitepress'

/**
 * vitepress markdown config
 * @see https://vitepress.vuejs.org/config/app-configs.html#markdown
 */
export const markdownConfig: MarkdownOptions = {
  lineNumbers: true,
  theme: 'material-palenight',
  config: (md) => {
    md.use(useCodeGroup.container, useCodeGroup.type, {
      render: useCodeGroup.render,
    })
    md.use(useCodeGroupItem.container, useCodeGroupItem.type, {
      render: useCodeGroupItem.render,
    })
  },
}
