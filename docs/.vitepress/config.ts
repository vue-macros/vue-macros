import { defineConfig } from 'vitepress'
import { withPwa } from './pwa'
import { pwa } from './configs'
import { en } from './locales/en'
import { zhCN } from './locales/zh-cn'

export default withPwa(
  defineConfig({
    lastUpdated: true,
    locales: {
      root: en,
      'zh-CN': zhCN,
    },
    pwa,
  })
)
