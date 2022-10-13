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
  '/marcos/': [
    {
      text: 'Marcos',
      items: [
        {
          text: 'All Macros',
          link: '/marcos/',
        },
        {
          text: 'defineOptions',
          link: '/marcos/define-options',
        },
        {
          text: 'defineModel',
          link: '/marcos/define-model',
        },
        {
          text: 'defineRender',
          link: '/marcos/define-render',
        },
        {
          text: 'shortEmits',
          link: '/marcos/short-emits',
        },
        {
          text: 'shortVModel',
          link: '/marcos/short-vmodel',
        },
        {
          text: 'hoistStatic',
          link: '/marcos/hoist-static',
        },
        {
          text: 'setupComponent',
          link: '/marcos/setup-component',
        },
        {
          text: 'setupSFC',
          link: '/marcos/setup-sfc',
        },
      ],
    },
  ],
}
