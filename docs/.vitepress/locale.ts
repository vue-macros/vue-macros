import { docsLink, githubLink } from '../../macros/repo'
import { createTranslate } from './i18n/utils'
import type { DefaultTheme, HeadConfig, LocaleConfig } from 'vitepress'

export function getLocaleConfig(lang: string) {
  const t = createTranslate(lang)

  const urlPrefix = lang && lang !== 'en' ? (`/${lang}` as const) : ''
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
      base: urlPrefix,
      items: [
        {
          text: t('Getting Started'),
          link: `/guide/getting-started`,
        },
        {
          text: t('Bundler Integration'),
          link: `/guide/bundler-integration`,
        },
        {
          text: t('Nuxt Integration'),
          link: `/guide/nuxt-integration`,
        },
        {
          text: t('Astro Integration'),
          link: `/guide/astro-integration`,
        },
        {
          text: t('ESLint Integration'),
          link: '/guide/eslint-integration',
        },
        {
          text: t('Configurations'),
          link: `/guide/configurations`,
        },
        {
          text: t('Interactive Example'),
          link: `/interactive`,
        },
      ],
    },
    {
      text: t('Macros'),
      base: `${urlPrefix}/macros`,
      items: [
        {
          text: t('All Macros'),
          link: `/`,
        },

        {
          text: t('Official'),
          items: [
            {
              text: 'defineOptions',
              link: `/define-options`,
            },
            {
              text: 'defineSlots',
              link: `/define-slots`,
            },
            {
              text: 'shortEmits',
              link: `/short-emits`,
            },
          ],
        },

        {
          text: t('Stable'),
          items: [
            {
              text: 'defineModels',
              link: `/define-models`,
            },
            {
              text: 'defineProps',
              link: `/define-props`,
            },
            {
              text: 'definePropsRefs',
              link: `/define-props-refs`,
            },
            {
              text: 'defineRender',
              link: `/define-render`,
            },
            {
              text: 'shortVmodel',
              link: `/short-vmodel`,
            },
          ],
        },

        {
          text: t('Experimental'),
          items: [
            {
              text: 'defineProp',
              link: `/define-prop`,
            },
            {
              text: 'defineEmit',
              link: `/define-emit`,
            },
            {
              text: 'setupComponent',
              link: `/setup-component`,
            },
            {
              text: 'setupSFC',
              link: `/setup-sfc`,
            },
            {
              text: 'chainCall',
              link: `/chain-call`,
            },
          ],
        },
      ],
    },
    {
      text: t('Features'),
      base: `${urlPrefix}/features`,
      items: [
        {
          text: t('Official'),
          items: [
            {
              text: 'hoistStatic',
              link: `/hoist-static`,
            },
            {
              text: 'shortBind',
              link: `/short-bind`,
            },
          ],
        },

        {
          text: t('Stable'),
          items: [
            {
              text: 'betterDefine',
              link: `/better-define`,
            },
            {
              text: 'reactivityTransform',
              link: `/reactivity-transform`,
            },
            {
              text: 'jsxDirective',
              link: `/jsx-directive`,
            },
          ],
        },

        {
          text: t('Experimental'),
          items: [
            {
              text: 'namedTemplate',
              link: `/named-template`,
            },
            {
              text: 'exportProps',
              link: `/export-props`,
            },
            {
              text: 'exportExpose',
              link: `/export-expose`,
            },
            {
              text: 'exportRender',
              link: `/export-render`,
            },
            {
              text: 'booleanProp',
              link: `/boolean-prop`,
            },
            {
              text: 'scriptLang',
              link: `/script-lang`,
            },
          ],
        },
      ],
    },
    {
      text: 'Volar',
      base: `${urlPrefix}/volar`,
      items: [
        {
          text: t('Stable'),
          items: [
            {
              text: 'setupJsdoc',
              link: `/setup-jsdoc`,
            },
            {
              text: 'defineGeneric',
              link: `/define-generic`,
            },
          ],
        },
        {
          text: t('Experimental'),
          items: [
            {
              text: 'templateRef',
              link: `/template-ref`,
            },
            {
              text: 'scriptSFC',
              link: `/script-sfc`,
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
