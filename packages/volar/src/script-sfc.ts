import { createFilter, REGEX_NODE_MODULES } from '@vue-macros/common'
import { parse, type VueLanguagePlugin } from '@vue/language-core'
import { getVolarOptions, patchSFC } from './common'

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'scriptSFC')
  if (!volarOptions) return []

  const isValidFile = createFilter({
    ...volarOptions,
    include: volarOptions.include || /\.[cm]?tsx?$/,
    exclude: volarOptions.exclude || REGEX_NODE_MODULES,
  })

  return {
    name: 'vue-macros-script-sfc',
    version: 2.1,
    order: -1,
    isValidFile,
    parseSFC2(fileName, _, content) {
      if (!isValidFile(fileName)) return

      const lang = fileName.split(/\.[cm]?/).at(-1)
      const prefix = `<script lang="${lang}">`
      const sfc = parse(`${prefix}${content}\n</script>`)
      patchSFC(sfc.descriptor.script, prefix.length)
      return sfc
    },
  }
}

export default plugin
