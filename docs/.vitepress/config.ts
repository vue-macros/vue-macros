import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
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
    themeConfig: {
      search: {
        provider: 'local',
        options: {
          locales: {
            'zh-CN': {
              translations: {
                button: {
                  buttonText: '搜索文档',
                  buttonAriaLabel: '搜索文档',
                },
                modal: {
                  noResultsText: '无法找到相关结果',
                  resetButtonTitle: '清除查询条件',
                  footer: {
                    selectText: '选择',
                    navigateText: '切换',
                    closeText: '关闭',
                  },
                },
              },
            },
          },
        },
      },
    },
    sitemap: {
      hostname: 'https://vue-macros.sxzz.moe',
    },
    pwa,
  })
)
