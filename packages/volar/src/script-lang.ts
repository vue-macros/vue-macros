import { type VueLanguagePlugin, parse } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions: { vueMacros } }) => ({
  name: 'vue-macros-script-lang',
  version: 2,
  order: -1,
  parseSFC(_, content) {
    const sfc = parse(content)
    const {
      descriptor: { script, scriptSetup },
    } = sfc
    const lang = vueMacros?.scriptLang?.default || 'ts'

    if (script && !script.attrs.lang) {
      script.lang = lang
    }
    if (scriptSetup && !scriptSetup.attrs.lang) {
      scriptSetup.lang = lang
    }
    return sfc
  },
})

export default plugin
