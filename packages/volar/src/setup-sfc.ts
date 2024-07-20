import { type VueLanguagePlugin, parse } from '@vue/language-core'
import { REGEX_SETUP_SFC } from '@vue-macros/common'
import { patchSFC } from './common'

function isValidFile(fileName: string) {
  return REGEX_SETUP_SFC.test(fileName)
}

const plugin: VueLanguagePlugin = () => {
  return {
    version: 2.1,
    order: -1,
    isValidFile,
    parseSFC2(fileName, _, content) {
      if (!isValidFile(fileName)) return

      const lang = fileName.split(/\.[cm]?/).at(-1)
      const prefix = `<script setup lang="${lang}">\n`
      return patchSFC(parse(`${prefix}${content}\n</script>`), prefix.length)
    },
  }
}

export default plugin
