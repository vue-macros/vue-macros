import { type EnhanceAppContext } from 'vitepress'
import Theme from 'vitepress/theme'
import WarnBadge from '../components/WarnBadge.vue'
import StabilityLevel from '../components/StabilityLevel.vue'
import Layout from './Layout.vue'
import 'uno.css'
import './style.css'

export default {
  ...Theme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('WarnBadge', WarnBadge)
    app.component('StabilityLevel', StabilityLevel)
  },
}
