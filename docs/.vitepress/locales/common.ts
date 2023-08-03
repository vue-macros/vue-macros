import { type DefaultTheme, type HeadConfig } from 'vitepress'
import { webLink } from '.vitepress/configs/meta'

export const themeConfig = {
  logo: '/favicon.svg',
  socialLinks: [
    { icon: 'github', link: 'https://github.com/vue-macros/vue-macros' },
  ],
} satisfies DefaultTheme.Config

export const head: HeadConfig[] = [
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ['meta', { property: 'og:type', content: 'website' }],
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

export const sidebar = (lang: string): DefaultTheme.SidebarItem[] => {
  const urlPrefix = lang ? `/${lang}` : ''
  return [
    {
      text: 'Guide',
      items: [
        {
          text: 'Getting Started',
          link: `${urlPrefix}/guide/getting-started`,
        },
        {
          text: 'Bundler Integration',
          link: `${urlPrefix}/guide/bundler-integration`,
        },
        {
          text: 'Nuxt Integration',
          link: `${urlPrefix}/guide/nuxt-integration`,
        },
        {
          text: 'Configurations',
          link: `${urlPrefix}/guide/configurations`,
        },
      ],
    },
    {
      text: 'Macros',
      items: [
        {
          text: 'All Macros',
          link: `${urlPrefix}/macros/`,
        },

        {
          text: 'Official',
          items: [
            {
              text: 'defineOptions',
              link: `${urlPrefix}/macros/define-options`,
            },
            {
              text: 'defineSlots',
              link: `${urlPrefix}/macros/define-slots`,
            },
            {
              text: 'shortEmits',
              link: `${urlPrefix}/macros/short-emits`,
            },
          ],
        },

        {
          text: 'Stable',
          items: [
            {
              text: 'defineModels',
              link: `${urlPrefix}/macros/define-models`,
            },
            {
              text: 'defineProps',
              link: `${urlPrefix}/macros/define-props`,
            },
            {
              text: 'definePropsRefs',
              link: `${urlPrefix}/macros/define-props-refs`,
            },
            {
              text: 'defineRender',
              link: `${urlPrefix}/macros/define-render`,
            },
            {
              text: 'shortVmodel',
              link: `${urlPrefix}/macros/short-vmodel`,
            },
          ],
        },

        {
          text: 'Experimental',
          items: [
            {
              text: 'defineProp',
              link: `${urlPrefix}/macros/define-prop`,
            },
            {
              text: 'defineEmit',
              link: `${urlPrefix}/macros/define-emit`,
            },
            {
              text: 'setupComponent',
              link: `${urlPrefix}/macros/setup-component`,
            },
            {
              text: 'setupSFC',
              link: `${urlPrefix}/macros/setup-sfc`,
            },
            {
              text: 'chainCall',
              link: `${urlPrefix}/macros/chain-call`,
            },
          ],
        },
      ],
    },
    {
      text: 'Features',
      items: [
        {
          text: 'Official',
          items: [
            {
              text: 'hoistStatic',
              link: `${urlPrefix}/features/hoist-static`,
            },
          ],
        },

        {
          text: 'Stable',
          items: [
            {
              text: 'betterDefine',
              link: `${urlPrefix}/features/better-define`,
            },
            {
              text: 'reactivityTransform',
              link: `${urlPrefix}/features/reactivity-transform`,
            },
          ],
        },

        {
          text: 'Experimental',
          items: [
            {
              text: 'namedTemplate',
              link: `${urlPrefix}/features/named-template`,
            },
            {
              text: 'exportProps',
              link: `${urlPrefix}/features/export-props`,
            },
            {
              text: 'exportExpose',
              link: `${urlPrefix}/features/export-expose`,
            },
            {
              text: 'jsxDirective',
              link: `${urlPrefix}/features/jsx-directive`,
            },
            {
              text: 'booleanProp',
              link: `${urlPrefix}/features/boolean-prop`,
            },
          ],
        },
      ],
    },
  ]
}
