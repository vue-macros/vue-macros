import { createFilter } from '@vue-macros/common'
import { parse, type VueLanguagePlugin } from '@vue/language-core'
import { getVolarOptions } from './common'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions: { vueMacros } }) => {
  const volarOptions = getVolarOptions(vueMacros, 'scriptLang', false)
  if (!volarOptions) return []

  const filter = createFilter(volarOptions)

  return {
    name: 'vue-macros-script-lang',
    version: 2.1,
    order: -1,
    parseSFC(fileName, content) {
      if (!filter(fileName)) return

      const sfc = parse(content)
      const {
        descriptor: { script, scriptSetup },
      } = sfc
      const lang = volarOptions.defaultLang || 'ts'

      if (script && !script.attrs.lang) {
        script.lang = lang
      }
      if (scriptSetup && !scriptSetup.attrs.lang) {
        scriptSetup.lang = lang
      }
      return sfc
    },
  }
}

export default plugin
