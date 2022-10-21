import { defineConfig } from 'vitepress'
import { withPwa } from './pwa'
import { markdownConfig, nav, sidebar } from './configs'

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
    pwa: {
      outDir: '.vitepress/dist',
      manifest: {
        name: 'Vue Macros',
        short_name: 'Vue Macros',
        description: 'Explore and extend more macros and syntax sugar to Vue.',
        theme_color: '#914796',
        id: '/',
        icons: [
          {
            src: '/favicon.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'maskable any',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'jsdelivr-images-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    },
  })
)
