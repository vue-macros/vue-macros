import { createRequire } from 'node:module'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import ts from 'typescript'
import { defineConfig } from 'vitepress'
import { docsLink } from '../../macros'
import { getLocaleConfig } from './locale'

const require = createRequire(import.meta.url)

const booleanProp = require('@vue-macros/volar/boolean-prop')
const defineEmit = require('@vue-macros/volar/define-emit')
const defineModels = require('@vue-macros/volar/define-models')
// Volar plugins
const defineOptions = require('@vue-macros/volar/define-options')
const defineProp = require('@vue-macros/volar/define-prop')
const defineProps = require('@vue-macros/volar/define-props')
const definePropsRefs = require('@vue-macros/volar/define-props-refs')
const defineSlots = require('@vue-macros/volar/define-slots')
const exportExpose = require('@vue-macros/volar/export-expose')
const exportRender = require('@vue-macros/volar/export-render')
const jsxDirective = require('@vue-macros/volar/jsx-directive')

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
            plugins: [
              defineOptions,
              defineModels,
              defineSlots,
              defineEmit,
              defineProp,
              defineProps,
              definePropsRefs,
              exportRender,
              exportExpose,
              jsxDirective,
              booleanProp,
            ],
          },
        },
      }),
    ],
  },
})
