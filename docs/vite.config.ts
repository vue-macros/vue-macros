import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import Devtools from 'vite-plugin-vue-devtools'
import {
  groupIconVitePlugin,
  localIconLoader,
} from 'vitepress-plugin-group-icons'
import { githubLink } from '../macros/repo'

export default defineConfig({
  plugins: [
    VueJsx(),
    Unocss(),
    Devtools(),
    GitChangelog({
      repoURL: () => githubLink,
      mapAuthors: [
        {
          name: 'Kevin Deng',
          username: 'sxzz',
          mapByEmailAliases: ['sxzz@sxzz.moe'],
        },
        {
          name: 'zhiyuanzmj',
          username: 'zhiyuanzmj',
          mapByEmailAliases: ['260480378@qq.com'],
        },
      ],
    }),
    GitChangelogMarkdownSection(),
    groupIconVitePlugin({
      customIcon: {
        rspack: localIconLoader(import.meta.url, './assets/rspack.svg'),
        rsbuild: localIconLoader(import.meta.url, './assets/rsbuild.svg'),
      },
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@nolebase/vitepress-plugin-enhanced-readabilities/client',
      'vitepress',
    ],
  },
  ssr: {
    noExternal: [
      '@nolebase/vitepress-plugin-enhanced-readabilities',
      '@nolebase/vitepress-plugin-highlight-targeted-heading',
    ],
  },
})
