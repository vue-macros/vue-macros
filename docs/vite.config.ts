import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import Jsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  build: {
    // sourcemap: true,
    // minify: false,
    ssrManifest: false,
    manifest: false,
  },
  plugins: [Unocss(), DefineOptions(), Jsx()],
})
