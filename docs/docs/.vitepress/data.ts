import type { DefaultTheme } from 'vitepress'

export const sidebars: DefaultTheme.Sidebar = {
  '/guide/': [
    {
      text: 'Guide',
      items: [
        {
          text: 'Getting Started',
          link: '/guide/getting-started',
        },
      ],
    },
  ],
  '/macros/': [
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
          text: 'shortVModel',
          link: '/macros/short-vmodel',
        },
        {
          text: 'hoistStatic',
          link: '/macros/hoist-static',
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
  ],
}
