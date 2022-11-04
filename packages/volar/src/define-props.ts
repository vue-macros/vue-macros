import { parseSFC } from '@vue-macros/common'
import { transfromDefineProps } from '@vue-macros/define-props'
import type { VueLanguagePlugin } from '@volar/vue-language-core'

const plugin: VueLanguagePlugin = () => {
  return {
    name: 'vue-macros-define-props',
    version: 1,
    order: -1,
    parseSFC(fileName, content) {
      const result = transfromDefineProps(content, fileName)
      if (!result?.code) return
      const { sfc } = parseSFC(result.code, fileName)
      return sfc
    },
  }
}

export default plugin
