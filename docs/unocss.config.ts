import { presetAttributify, presetUno, transformerDirectives } from 'unocss'

export default {
  presets: [presetAttributify(), presetUno()],
  transformers: [transformerDirectives()],
}
