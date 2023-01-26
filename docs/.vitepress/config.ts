import { defineConfig } from 'vitepress'
import { withPwa } from './pwa'
import {
  headEn,
  headZhCn,
  nav,
  pwa,
  sidebar,
  webDescriptionEn,
  webDescriptionZhCn,
  webName,
} from './configs'

export default withPwa(
  defineConfig({
    title: webName,
    lastUpdated: true,
    cleanUrls: 'disabled',

    themeConfig: {
      logo: '/favicon.svg',
      footer: {
        message: 'Made with ❤️',
        copyright:
          'MIT License © 2022-PRESENT <a href="https://github.com/sxzz">三咲智子</a>',
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
    locales: {
      root: {
        label: 'English',
        description: webDescriptionEn,
        head: headEn,
        lang: 'en',
      },
      'zh-CN': {
        label: 'Chinese',
        description: webDescriptionZhCn,
        head: headZhCn,
        lang: 'zh-CN',
      },
    },
    pwa,
  })
)
