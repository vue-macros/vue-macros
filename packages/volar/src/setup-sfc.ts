import { createFilter, REGEX_SETUP_SFC } from '@vue-macros/common'
import { parse, type VueLanguagePlugin } from '@vue/language-core'
import { getVolarOptions, patchSFC } from './common'

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'setupSFC')
  if (!volarOptions) return []

  const isValidFile = createFilter({
    ...volarOptions,
    include: volarOptions.include || REGEX_SETUP_SFC,
  })

  return {
    name: 'vue-macros-setup-sfc',
    version: 2.1,
    order: -1,
    isValidFile,
    parseSFC2(fileName, _, content) {
      if (!isValidFile(fileName)) return

      const lang = fileName.split(/\.[cm]?/).at(-1)
      const prefix = `<script setup lang="${lang}">`
      const sfc = parse(`${prefix}${content}\n</script>`)
      patchSFC(sfc.descriptor.scriptSetup, prefix.length)
      return sfc
    },
  }
}

export default plugin
