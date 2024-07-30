import { createFilter } from '@vue-macros/common'
import { parse, type VueLanguagePlugin } from '@vue/language-core'
import { getVolarOptions, patchSFC } from './common'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions: { vueMacros } }) => {
  const volarOptions = getVolarOptions(vueMacros, 'scriptSFC', false)
  if (!volarOptions) return []

  const isValidFile = createFilter({
    ...volarOptions,
    include: volarOptions.include || [/\.[cm]?tsx?$/],
  })

  return {
    name: 'vue-macros-script-sfc',
    version: 2.1,
    order: -1,
    isValidFile: (fileName) => {
      return isValidFile(fileName)
    },
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
