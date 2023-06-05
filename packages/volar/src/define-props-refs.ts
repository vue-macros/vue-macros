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

export default plugin

const REGEX = /(const\s*{.*?)((,\s*)?withDefaults)(.*?})/
function rewriteImports(file: VueEmbeddedFile) {
  const idx = file.content.findIndex(
    (s) => typeof s === 'string' && REGEX.test(s)
  )
  if (idx === -1) return

  file.content[idx] = (file.content[idx] as string).replace(REGEX, '$1$4')
}
