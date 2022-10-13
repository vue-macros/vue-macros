import { useMarkdownContainer } from './plugins/container'

export const useCodeGroup = useMarkdownContainer({
  type: 'code-group',
  before: () => '<CodeGroup>\n',
  after: () => '</CodeGroup>\n',
})

export const useCodeGroupItem = useMarkdownContainer({
  type: 'code-group-item',
  before: (info: string) => `<CodeGroupItem title="${info}">\n`,
  after: () => '</CodeGroupItem>\n',
})
