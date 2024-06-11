import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'

// Volar plugins
import defineOptions from '@vue-macros/volar/define-options'
import defineEmit from '@vue-macros/volar/define-emit'
import defineProp from '@vue-macros/volar/define-prop'
import defineProps from '@vue-macros/volar/define-props'
import definePropsRefs from '@vue-macros/volar/define-props-refs'
import defineSlots from '@vue-macros/volar/define-slots'
import defineModels from '@vue-macros/volar/define-models'
import exportExpose from '@vue-macros/volar/export-expose'
import exportRender from '@vue-macros/volar/export-render'
import jsxDirective from '@vue-macros/volar/jsx-directive'
import booleanProp from '@vue-macros/volar/boolean-prop'

import { docsLink } from '../../macros'
import { getLocaleConfig, pwa } from './configs'

export default withPwa(
  defineConfig({
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
    pwa,
    markdown: {
      codeTransformers: [
        transformerTwoslash({
          twoslashOptions: {
            compilerOptions: {
              jsx: 1,
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
  }),
)
