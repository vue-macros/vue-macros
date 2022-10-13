import { defineConfig } from 'vitepress'
import { nav, sidebar } from './data'

export default defineConfig({
  lang: 'en-US',
  title: 'Vue Macros',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Vue Macros' }],
    ['meta', { property: 'og:url', content: 'https://vue-macros.sxzz.moe' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Explore and extend more macros and syntax sugar to Vue.',
      },
    ],
    ['meta', { name: 'theme-color', content: '#914796' }],
  ],

  description: 'Explore and extend more macros and syntax sugar to Vue.',
  lastUpdated: true,
  cleanUrls: 'with-subfolders',
  markdown: {
    theme: 'material-palenight',
    lineNumbers: true,
  },

  vue: {
    reactivityTransform: true,
  },

  themeConfig: {
    logo: '/logo.svg',
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
