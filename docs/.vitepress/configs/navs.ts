import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Macros', link: '/macros/' },
  { text: 'Features', link: '/features/hoist-static' },
]

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: 'Guide',
    items: [
      {
        text: 'Getting Started',
        link: '/guide/getting-started',
      },
    ],
  },
  {
    text: 'Macros',
    items: [
      {
        text: 'All Macros',
        link: '/macros/',
      },
      {
        text: 'defineOptions',
        link: '/macros/define-options',
      },
      {
        text: 'defineModel',
        link: '/macros/define-model',
      },
      {
        text: 'defineRender',
        link: '/macros/define-render',
      },
      {
        text: 'shortEmits',
        link: '/macros/short-emits',
      },
      {
        text: 'shortVmodel',
        link: '/macros/short-vmodel',
      },
      {
        text: 'setupComponent',
        link: '/macros/setup-component',
      },
      {
        text: 'setupSFC',
        link: '/macros/setup-sfc',
      },
    ],
  },
  {
    text: 'Features',
    items: [
      {
        text: 'hoistStatic',
        link: '/features/hoist-static',
      },
    ],
  },
]
