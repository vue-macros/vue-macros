import { createFilter } from '@vue-macros/common'
import { parse } from '@vue/language-core'
import type { VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'scriptLang'> = (_, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

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
      const lang = options.defaultLang || 'ts'

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
export { plugin as 'module.exports' }
