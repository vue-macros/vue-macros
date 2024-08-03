import { createFilter, REGEX_NODE_MODULES } from '@vue-macros/common'
import { parse } from '@vue/language-core'
import { patchSFC, type VueMacrosPlugin } from './common'

const plugin: VueMacrosPlugin<'scriptSFC'> = (_, options = {}) => {
  if (!options) return []

  const isValidFile = createFilter({
    ...options,
    include: options.include || /\.[cm]?tsx?$/,
    exclude: options.exclude || REGEX_NODE_MODULES,
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
