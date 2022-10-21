import { defineConfig } from 'vitepress'
import { withPwa } from './pwa'
import { markdownConfig, nav, pwa, sidebar } from './configs'

export default withPwa(
  defineConfig({
    lang: 'en-US',
    title: 'Vue Macros',
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
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
      [
        'script',
        {
          async: '',
          src: 'https://www.googletagmanager.com/gtag/js?id=G-29NKGSL23C',
        },
      ],
      [
        'script',
        {},
        `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-29NKGSL23C');`,
      ],
    ],

    description: 'Explore and extend more macros and syntax sugar to Vue.',
    lastUpdated: true,
    cleanUrls: 'disabled',
    markdown: markdownConfig,

    vue: {
      reactivityTransform: true,
    },

    themeConfig: {
      logo: '/favicon.svg',
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
    pwa,
  })
)
