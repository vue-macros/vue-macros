import type { VueLanguagePlugin } from '@volar/vue-language-core'

export const plugin: VueLanguagePlugin = ({ modules }) => {
  modules.typescript
  return {
    // parseSFC(fileName, content) {
    //   console.log(fileName)
    //   // return this.parseSFC!(fileName, content)
    // },
    // compileSFCTemplate() {
    //   console.log(123)
    //   // this.compileSFCTemplate!()
    // },
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (!embeddedFile.isTsHostFile) return
      const code = embeddedFile.codeGen.getText()
      embeddedFile.codeGen.addCode2()
      // addExtraReferenceVirtualCode('scriptSetup', scriptSetupRanges.propsTypeArg.start, scriptSetupRanges.propsTypeArg.end);
      console.log(embeddedFile.codeGen.getText())
    },
  }
}
