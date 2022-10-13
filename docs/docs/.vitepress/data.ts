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
      ],
    },
  ],
}
