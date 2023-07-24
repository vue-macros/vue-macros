import {
  type DefaultTheme,
  type HeadConfig,
  type LocaleConfig,
} from 'vitepress'
import * as common from './common'

export const title = 'Vue Macros'
export const description = '探索更多宏和语法糖到 Vue 中。'

export const nav: DefaultTheme.NavItem[] = [
  { text: '指南', link: '/zh-CN/guide/getting-started', activeMatch: 'guide' },
  { text: '宏', link: '/zh-CN/macros/', activeMatch: 'macros' },
  {
    text: '特性',
    link: '/zh-CN/features/hoist-static',
    activeMatch: 'features',
  },
]

export const sidebar = common.sidebar('zh-CN')

const sidebarTitle: string[] = ['指南', '宏', '特性']
const sidebarItem: string[][] = [
  ['入门', '打包器集成', 'Nuxt 集成', '配置'],
  ['全部宏'],
  [''],
]
sidebar.forEach((bar, i) => {
  bar.text = sidebarTitle[i]
  bar.items!.forEach((item, j) => {
    if (sidebarItem[i][j]) item.text = sidebarItem[i][j]
  })
})

export const themeConfig: DefaultTheme.Config = {
  ...common.themeConfig,

  outline: {
    label: '页面导航',
  },
  lastUpdatedText: '最后更新于',
  footer: {
    message: '用 ❤️ 发电',
    copyright:
      'MIT License © 2022-PRESENT <a href="https://github.com/sxzz">三咲智子</a>',
  },
  editLink: {
    pattern: 'https://github.com/vue-macros/vue-macros/edit/main/docs/:path',
    text: '在 GitHub 上编辑此页面',
  },
  nav,
  sidebar,
  darkModeSwitchLabel: '外观',
  sidebarMenuLabel: '目录',
  returnToTopLabel: '返回顶部',
  docFooter: {
    prev: '上一页',
    next: '下一页',
  },
}

export const head: HeadConfig[] = [
  ['meta', { property: 'og:title', content: title }],
  ['meta', { property: 'og:description', content: description }],
  ...common.head,
]

export const zhCN: LocaleConfig<DefaultTheme.Config>[string] = {
  label: '简体中文',
  lang: 'zh-CN',
  title,
  description,
  head,
  themeConfig,
}
