import { createRequire } from 'node:module'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import ts from 'typescript'
import { defineConfig } from 'vitepress'
import { docsLink } from '../../macros'
import { getLocaleConfig } from './locale'

const require = createRequire(import.meta.url)
const vueMacrosPlugin = require('@vue-macros/volar')

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
    codeTransformers: [
      transformerTwoslash({
        twoslashOptions: {
          compilerOptions: {
            jsx: ts.JsxEmit.Preserve,
            jsxFactory: 'vue',
            types: ['unplugin-vue-macros/macros-global', 'vue/jsx'],
          },
          vueCompilerOptions: {
            plugins: [vueMacrosPlugin],
            // @ts-ignore
            vueMacros: {
              scriptLang: true,
              setupSFC: true,
              booleanProp: true,
              defineEmit: true,
              defineProp: true,
              templateRef: true,
              defineGeneric: true,
            },
          },
        },
      }),
    ],
  },
})
