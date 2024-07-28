import { docsLink, githubLink } from '../../macros/repo'
import { createTranslate } from './i18n/utils'
import type { DefaultTheme, HeadConfig, LocaleConfig } from 'vitepress'

export function getLocaleConfig(lang: string) {
  const t = createTranslate(lang)

  const urlPrefix = lang && lang !== 'en' ? `/${lang}` : ''
  const title = t('Vue Macros')
  const description = t('Explore more macros and syntax sugar to Vue.')

  const head: HeadConfig[] = [
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: `${docsLink}/og.png` }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: docsLink }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:image', content: `${docsLink}/og.png` }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
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
      `window.dataLayer = window.dataLayer || []
        function gtag() {
          dataLayer.push(arguments)
        }
        gtag('js', new Date())
        gtag('config', 'G-29NKGSL23C')`,
    ],
  ]

  const nav: DefaultTheme.NavItem[] = [
    {
      text: t('Guide'),
      link: `${urlPrefix}/guide/getting-started`,
      activeMatch: 'guide',
    },
    {
      text: t('Macros'),
      link: `${urlPrefix}/macros/`,
      activeMatch: 'macros',
    },
    {
      text: t('Features'),
      link: `${urlPrefix}/features/hoist-static`,
      activeMatch: 'features',
    },
    {
      text: 'Volar',
      link: `${urlPrefix}/volar/template-ref`,
      activeMatch: 'volar',
    },
    {
      text: t('Interactive Example'),
      link: `${urlPrefix}/interactive/`,
      activeMatch: 'interactive',
    },
  ]

  const sidebar: DefaultTheme.SidebarItem[] = [
    {
      text: t('Guide'),
      items: [
        {
          text: t('Getting Started'),
          link: `${urlPrefix}/guide/getting-started`,
        },
        {
          text: t('Bundler Integration'),
          link: `${urlPrefix}/guide/bundler-integration`,
        },
        {
          text: t('Nuxt Integration'),
          link: `${urlPrefix}/guide/nuxt-integration`,
        },
        {
          text: t('Astro Integration'),
          link: `${urlPrefix}/guide/astro-integration`,
        },
        {
          text: t('Configurations'),
          link: `${urlPrefix}/guide/configurations`,
        },
        {
          text: t('Interactive Example'),
          link: `${urlPrefix}/interactive/`,
        },
      ],
    },
    {
      text: t('Macros'),
      items: [
        {
          text: t('All Macros'),
          link: `${urlPrefix}/macros/`,
        },

        {
          text: t('Official'),
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
          text: t('Stable'),
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
          text: t('Experimental'),
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
      text: t('Features'),
      items: [
        {
          text: t('Official'),
          items: [
            {
              text: 'hoistStatic',
              link: `${urlPrefix}/features/hoist-static`,
            },
            {
              text: 'shortBind',
              link: `${urlPrefix}/features/short-bind`,
            },
          ],
        },

        {
          text: t('Stable'),
          items: [
            {
              text: 'betterDefine',
              link: `${urlPrefix}/features/better-define`,
            },
            {
              text: 'reactivityTransform',
              link: `${urlPrefix}/features/reactivity-transform`,
            },
            {
              text: 'jsxDirective',
              link: `${urlPrefix}/features/jsx-directive`,
            },
          ],
        },

        {
          text: t('Experimental'),
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
              text: 'exportRender',
              link: `${urlPrefix}/features/export-render`,
            },
            {
              text: 'booleanProp',
              link: `${urlPrefix}/features/boolean-prop`,
            },
            {
              text: 'scriptLang',
              link: `${urlPrefix}/features/script-lang`,
            },
          ],
        },
      ],
    },
    {
      text: 'Volar',
      items: [
        {
          text: t('Stable'),
          items: [
            {
              text: 'setupJsdoc',
              link: `${urlPrefix}/volar/setup-jsdoc`,
            },
          ],
        },
        {
          text: t('Experimental'),
          items: [
            {
              text: 'templateRef',
              link: `${urlPrefix}/volar/template-ref`,
            },
            {
              text: 'defineGeneric',
              link: `${urlPrefix}/volar/define-generic`,
            },
          ],
        },
      ],
    },
  ]

  const themeConfig: DefaultTheme.Config = {
    logo: '/favicon.svg',
    nav,
    sidebar,
    socialLinks: [
      { icon: 'discord', link: 'https://discord.com/invite/RbVHMsFVXU' },
      { icon: 'github', link: githubLink },
    ],
    footer: {
      message: t('Made with ❤️'),
      copyright:
        'MIT License © 2022-PRESENT <a href="https://github.com/sxzz">三咲智子 Kevin Deng</a>',
    },
    editLink: {
      pattern: `${githubLink}/edit/main/docs/:path`,
      text: t('Edit this page on GitHub'),
    },
  }

  if (lang === 'zh-CN') {
    Object.assign(themeConfig, {
      outline: {
        label: '页面导航',
      },
      lastUpdatedText: '最后更新于',
      darkModeSwitchLabel: '外观',
      sidebarMenuLabel: '目录',
      returnToTopLabel: '返回顶部',
      langMenuLabel: '选择语言',
      docFooter: {
        prev: '上一页',
        next: '下一页',
      },
    } satisfies DefaultTheme.Config)
  }

  const localeConfig: LocaleConfig<DefaultTheme.Config>[string] = {
    label: t('English'),
    lang: t('en'),
    title,
    description,
    head,
    themeConfig,
  }

  return localeConfig
}
