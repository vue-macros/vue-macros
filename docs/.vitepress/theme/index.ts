import { h } from 'vue'
import Theme from 'vitepress/theme'
import HomePage from '../components/HomePage.vue'
import CodeGroup from './components/CodeGroup.vue'
import CodeGroupItemVue from './components/CodeGroupItem.vue'
import type { EnhanceAppContext } from 'vitepress'
import 'uno.css'
import './style.css'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomePage),
    })
  },
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('CodeGroup', CodeGroup)
    app.component('CodeGroupItem', CodeGroupItemVue)
  },
}
