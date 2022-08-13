import { compileScript, parse } from 'vue/compiler-sfc'
import type { TransformContext } from './context'
import type { SFCDescriptor, SFCScriptBlock } from 'vue/compiler-sfc'

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

export const addToScript = (ctx: TransformContext) => {
  const { scriptCode } = ctx
  if (scriptCode.prepend.length + scriptCode.append.length === 0) {
    return
  }

  const { sfc, s } = ctx
  const { script, scriptSetup, lang } = sfc
  if (script) {
    if (scriptCode.prepend) {
      s.appendRight(script.loc.start.offset, scriptCode.prepend)
      script.content = scriptCode.prepend + script.content
    }
    if (scriptCode.append) {
      s.appendRight(script.loc.end.offset, scriptCode.append)
      script.content = script.content + scriptCode.append
    }
  } else {
    const attrs = lang ? ` lang="${lang}"` : ''
    const content = `${scriptCode.prepend}\n${scriptCode.append}`
    s.prependLeft(0, `<script${attrs}>${content}</script>\n`)
    sfc.script = {
      type: 'script',
      content,
      attrs: scriptSetup?.attrs || {},
      loc: undefined as any,
    }
  }
}
