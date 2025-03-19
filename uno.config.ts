import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [presetWind3(), presetAttributify(), presetIcons()],
  transformers: [transformerDirectives()],
})
