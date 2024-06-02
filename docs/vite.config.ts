import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Devtools from 'vite-plugin-vue-devtools'
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite'
import { githubLink } from '../macros/repo'
export default defineConfig({
  plugins: [
    VueJsx(),
    Unocss(),
    Devtools(),
    GitChangelog({
      repoURL: () => githubLink,
    }),
    GitChangelogMarkdownSection(),
  ],
  optimizeDeps: {
    include: [
      '@nolebase/vitepress-plugin-enhanced-readabilities > @nolebase/ui > @rive-app/canvas',
    ],
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
