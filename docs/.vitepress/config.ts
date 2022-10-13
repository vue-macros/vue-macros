import { defineConfig } from 'vitepress'
import { nav, sidebar } from './data'

export default defineConfig({
  lang: 'en-US',
  title: 'Vue Macros',
  titleTemplate: 'Vue Macros',
  description: 'Explore and extend more macros and syntax sugar to Vue.',
  lastUpdated: true,
  cleanUrls: 'with-subfolders',
  markdown: {
    theme: 'material-palenight',
    lineNumbers: true,
  },
  themeConfig: {
    // logo: '/logo.png',
    footer: {
      message: 'Made with ❤️',
      copyright: 'MIT License © 2022 三咲智子',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sxzz/unplugin-vue-macros' },
    ],
    editLink: {
      pattern:
        'https://github.com/sxzz/unplugin-vue-macros/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    nav,
    sidebar,
  },
})
