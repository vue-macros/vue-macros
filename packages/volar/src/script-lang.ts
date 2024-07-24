import { createFilter } from '@rollup/pluginutils'
import { parse, type VueLanguagePlugin } from '@vue/language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions: { vueMacros } }) => ({
  name: 'vue-macros-script-lang',
  version: 2,
  order: -1,
  parseSFC(fileName, content) {
    const filter = createFilter(
      vueMacros?.scriptLang?.include || /.*/,
      vueMacros?.scriptLang?.exclude,
    )
    if (!filter(fileName)) return

    const sfc = parse(content)
    const {
      descriptor: { script, scriptSetup },
    } = sfc
    const lang = vueMacros?.scriptLang?.defaultLang || 'ts'

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
