import { compileScript, parse } from '@vue/compiler-sfc'
import { babelParse } from './ast'
import type { Program, Statement } from '@babel/types'
import type { MagicString } from './magic-string'
import type {
  SFCDescriptor,
  SFCParseResult,
  SFCScriptBlock,
} from '@vue/compiler-sfc'

export type _SFCScriptBlock = Omit<
  SFCScriptBlock,
  'scriptAst' | 'scriptSetupAst'
>

export type SFC = Omit<SFCDescriptor, 'script' | 'scriptSetup'> & {
  sfc: SFCParseResult
  script?: _SFCScriptBlock | null
  scriptSetup?: _SFCScriptBlock | null
  scriptCompiled: Omit<SFCScriptBlock, 'scriptAst' | 'scriptSetupAst'> & {
    scriptAst?: Statement[]
    scriptSetupAst?: Statement[]
  }
  lang: string | undefined
  scriptAst: Program | undefined
  setupAst: Program | undefined
} & Pick<SFCParseResult, 'errors'>

export const parseSFC = (code: string, id: string): SFC => {
  const sfc = parse(code, {
    filename: id,
  })
  const { descriptor, errors } = sfc
  const lang = (descriptor.script || descriptor.scriptSetup)?.lang

  let scriptCompiled: SFCScriptBlock | undefined
  return {
    sfc,
    ...descriptor,
    lang,
    errors,
    get scriptCompiled() {
      if (scriptCompiled) return scriptCompiled
      return (scriptCompiled = compileScript(descriptor, {
        id,
      }))
    },
    get setupAst() {
      if (!descriptor.scriptSetup) return
      return babelParse(descriptor.scriptSetup.content, lang)
    },
    get scriptAst() {
      if (!descriptor.script) return
      return babelParse(descriptor.script.content, lang)
    },
  }
}

export const addNormalScript = ({ script, lang }: SFC, s: MagicString) => {
  return {
    start() {
      if (script) return script.loc.end.offset

      const attrs = lang ? ` lang="${lang}"` : ''
      s.prependLeft(0, `<script${attrs}>`)
      return 0
    },

    end() {
      if (!script) s.appendRight(0, `\n</script>\n`)
    },
  }
}
