import { FileKind } from '@volar/language-core'
import {
  type VueEmbeddedFile,
  type VueLanguagePlugin,
} from '@volar/vue-language-core'

const plugin: VueLanguagePlugin = ({ vueCompilerOptions }) => {
  vueCompilerOptions.macros.defineProps.push('definePropsRefs')

  return {
    name: 'vue-macros-define-props-refs',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup?.content.includes('definePropsRefs')
      )
        return

      try {
        rewriteImports(embeddedFile)
      } catch {}
    },
  }
}

export = plugin

function rewriteImports(file: VueEmbeddedFile) {
  const idx = file.content.indexOf(
    `const { defineProps, defineEmits, defineSlots, defineModel, defineOptions, withDefaults } = await import('vue');\n`
  )
  if (idx === -1) return
  file.content[
    idx
  ] = `const { defineProps, defineEmits, defineSlots, defineModel, defineOptions } = await import('vue');\n`
}
