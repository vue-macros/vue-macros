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
    app.use(NolebaseGitChangelogPlugin)
  },
}
