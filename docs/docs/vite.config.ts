import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  plugins: [
    Unocss({
      presets: [presetAttributify(), presetUno()],
    }),
  ],
})
