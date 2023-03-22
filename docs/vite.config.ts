import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
// @ts-expect-error
import { SearchPlugin } from 'vitepress-plugin-search'

const searchOptions = {
  previewLength: 62,
  buttonLabel: 'Search',
  placeholder: 'Search docs',
}

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
    SearchPlugin(searchOptions),
    Unocss(),
  ],
})
