import Theme from 'vitepress/theme'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import WarnBadge from '../components/WarnBadge.vue'
import StabilityLevel from '../components/StabilityLevel.vue'
import Layout from './Layout.vue'
import type { EnhanceAppContext } from 'vitepress'
import 'uno.css'
import './style.css'
import '@shikijs/vitepress-twoslash/style.css'

export default {
  ...Theme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('WarnBadge', WarnBadge)
    app.component('StabilityLevel', StabilityLevel)
    app.use(TwoslashFloatingVue)
  },
}
