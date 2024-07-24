import { REGEX_SETUP_SFC } from '@vue-macros/common'
import { parse, type VueLanguagePlugin } from '@vue/language-core'
import type { SFCParseResult } from 'vue/compiler-sfc'

const plugin: VueLanguagePlugin = () => {
  function isValidFile(fileName: string) {
    return REGEX_SETUP_SFC.test(fileName)
  }

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

function patchSFC(sfc: SFCParseResult, offset: number): SFCParseResult {
  const {
    descriptor: { scriptSetup },
  } = sfc

  if (scriptSetup) {
    scriptSetup.loc.start.column -= offset
    scriptSetup.loc.start.offset -= offset
    scriptSetup.loc.end.offset -= offset
    if (scriptSetup.loc.end.line === scriptSetup.loc.start.line) {
      scriptSetup.loc.end.column -= offset
    }
  }
  return sfc
}
