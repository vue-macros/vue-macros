import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Devtools from 'vite-plugin-vue-devtools'

export default defineConfig({
  build: {
    ssr: false,
    ssrManifest: false,
    manifest: false,
  },
  plugins: [VueJsx(), Unocss(), Devtools()],
})
