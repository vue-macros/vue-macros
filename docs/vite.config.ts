import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  build: {
    ssr: false,
    ssrManifest: false,
    manifest: false,
  },
  plugins: [
    VueMacros({
      plugins: {
        vueJsx: VueJsx(),
      },
    }),
    Unocss(),
  ],
})
