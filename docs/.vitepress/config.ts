import { defineConfig } from 'vitepress'
import { withPwa } from './pwa'
import { nav, pwa, sidebar, webDescription, webLink, webName } from './configs'

export default withPwa(
  defineConfig({
    lang: 'en-US',
    title: 'Vue Macros',
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:title', content: webName }],
      ['meta', { property: 'og:url', content: webLink }],
      ['meta', { property: 'og:description', content: webDescription }],
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

    description: webDescription,
    lastUpdated: true,
    cleanUrls: 'disabled',

    vue: {
      reactivityTransform: true,
    },

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
    pwa,
  })
)
