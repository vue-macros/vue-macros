// import { useCodeGroup, useCodeGroupItem } from '../theme/components/markdown'
import {
  useCodeGroup,
  useCodeGroupItem,
} from '../theme/components/markdown/index'
import type { MarkdownOptions } from 'vitepress'

/**
 * vitepress markdown config
 * @see https://vitepress.vuejs.org/config/app-configs.html#markdown
 */
export const markdownConfig: MarkdownOptions = {
  lineNumbers: true,
  // material-palenight
  theme: {
    light: 'vitesse-light',
    dark: 'vitesse-dark',
  },
  config: (md) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    md.use(useCodeGroup.container, useCodeGroup.type, {
      render: useCodeGroup.render,
    })
    md.use(useCodeGroupItem.container, useCodeGroupItem.type, {
      render: useCodeGroupItem.render,
    })
  },
}
