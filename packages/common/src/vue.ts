import { compileScript, parse } from '@vue/compiler-sfc'
import type { TransformContext } from './types'
import type { SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'

export type _SFCScriptBlock = Omit<
  SFCScriptBlock,
  'scriptAst' | 'scriptSetupAst'
>

export type SFCCompiled = Omit<SFCDescriptor, 'script' | 'scriptSetup'> & {
  script?: _SFCScriptBlock | null
  scriptSetup?: _SFCScriptBlock | null
  scriptCompiled: SFCScriptBlock | undefined
}

export const parseSFC = (code: string, id: string): SFCCompiled => {
  const { descriptor } = parse(code, {
    filename: id,
  })
  let compiledScript: SFCScriptBlock | undefined
  if (descriptor.script || descriptor.scriptSetup) {
    compiledScript = compileScript(descriptor, {
      id,
    })
  }
  return {
    ...descriptor,
    scriptCompiled: compiledScript,
  }
}

export const addToScript = ({
  sfc: { script, scriptCompiled },
  s,
  scriptCode,
}: TransformContext) => {
  if (scriptCode.prepend.length + scriptCode.append.length === 0) {
    return
  }

  if (script) {
    if (scriptCode.prepend)
      s.appendRight(script.loc.start.offset, scriptCode.prepend)
    if (scriptCode.append)
      s.appendRight(script.loc.end.offset, scriptCode.append)
  } else {
    const lang = scriptCompiled?.attrs.lang
    const attrs = lang ? ` lang="${lang}"` : ''
    s.prependLeft(
      0,
      `<script${attrs}>${scriptCode.prepend}\n${scriptCode.append}</script>\n`
    )
  }
}
