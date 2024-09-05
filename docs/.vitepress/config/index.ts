import process from 'node:process'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import VueMacrosPlugin from '@vue-macros/volar'
import ts from 'typescript'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { docsLink } from '../../../macros'
import { getLocaleConfig } from './theme'

export default defineConfig({
  lastUpdated: true,
  locales: {
    root: getLocaleConfig('en'),
    'zh-CN': getLocaleConfig('zh-CN'),
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
    hostname: docsLink,
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
    codeTransformers: [
      ...(process.env.NO_TWOSLASH
        ? []
        : [
            transformerTwoslash({
              twoslashOptions: {
                compilerOptions: {
                  jsx: ts.JsxEmit.Preserve,
                  jsxFactory: 'vue',
                  types: ['unplugin-vue-macros/macros-global', 'vue/jsx'],
                },
                vueCompilerOptions: {
                  plugins: [VueMacrosPlugin],
                },
              },
            }),
          ]),
    ],
  },
})
