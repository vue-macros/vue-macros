import Theme from 'vitepress/theme'
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
import WarnBadge from '../components/WarnBadge.vue'
import StabilityLevel from '../components/StabilityLevel.vue'
import Layout from './Layout.vue'
import type { EnhanceAppContext } from 'vitepress'
import 'uno.css'
import './style.css'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'

export default {
  ...Theme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('WarnBadge', WarnBadge)
    app.component('StabilityLevel', StabilityLevel)
    app.use(NolebaseGitChangelogPlugin, {
      mapAuthors: [
        {
          name: 'Kevin Deng',
          mapByNameAliases: [
            '三咲智子 Kevin Deng',
            '三咲智子',
            '三咲智子 (Kevin)',
          ],
        },
      ],
    })
  },
}
