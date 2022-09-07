import { compileScript, parse } from '@vue/compiler-sfc'
import type { MagicString } from './magic-string'
import type { SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'

export type _SFCScriptBlock = Omit<
  SFCScriptBlock,
  'scriptAst' | 'scriptSetupAst'
>

export type SFCCompiled = Omit<SFCDescriptor, 'script' | 'scriptSetup'> & {
  script?: _SFCScriptBlock | null
  scriptSetup?: _SFCScriptBlock | null
  scriptCompiled: SFCScriptBlock
  lang: string | undefined
}

export const parseSFC = (code: string, id: string): SFCCompiled => {
  const { descriptor } = parse(code, {
    filename: id,
  })
  const lang = (descriptor.script || descriptor.scriptSetup)?.lang

  let scriptCompiled: SFCScriptBlock | undefined
  return {
    ...descriptor,
    lang,
    get scriptCompiled() {
      if (scriptCompiled) return scriptCompiled
      return (scriptCompiled = compileScript(descriptor, {
        id,
      }))
    },
  }
}

export const addNormalScript = (
  { script, lang }: SFCCompiled,
  s: MagicString
) => {
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
