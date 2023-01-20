import { webDescriptionEn, webDescriptionZhCn, webLink, webName } from './meta'
import type { HeadConfig } from 'vitepress'

const headCommon: HeadConfig[] = [
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:title', content: webName }],
  ['meta', { property: 'og:url', content: webLink }],
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
]

export const headEn: HeadConfig[] = [
  ['meta', { property: 'og:description', content: webDescriptionEn }],
  ...headCommon,
]

export const headZhCn: HeadConfig[] = [
  ['meta', { property: 'og:description', content: webDescriptionZhCn }],
  ...headCommon,
]
