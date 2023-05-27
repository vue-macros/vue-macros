import { type PwaOptions } from '@vite-pwa/vitepress'
import { icons } from './icons'

export const pwa: PwaOptions = {
  outDir: '.vitepress/dist',
  manifest: {
    name: 'Vue Macros',
    short_name: 'Vue Macros',
    description: 'Explore more macros and syntax sugar to Vue.',
    theme_color: '#914796',
    id: '/',
    icons,
  },
  devOptions: {
    enabled: false,
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
            maxAgeSeconds: 60 * 60 * 24 * 7, // <== 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // For `https://contrib.rocks/image?repo=sxzz/vue-macros`
        urlPattern: /^https:\/\/contrib.rocks\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'contrib-rocks-images-cache',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 7, // <== 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
}
