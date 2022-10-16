import { h } from 'vue'
import Theme from 'vitepress/theme'
import HomePage from '../components/HomePage.vue'
import WarnBadge from '../components/WarnBadge.vue'
import CodeGroup from './components/CodeGroup.vue'
import CodeGroupItem from './components/CodeGroupItem.vue'
import 'uno.css'
import './style.css'

import type { EnhanceAppContext } from 'vitepress'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomePage),
    })
  },
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('CodeGroup', CodeGroup)
    app.component('CodeGroupItem', CodeGroupItem)
    app.component('WarnBadge', WarnBadge)
  },
}
