import { parse } from '@vue/compiler-sfc'
import { babelParse } from './ast'
import { getLang } from './lang'
import { REGEX_VUE_SFC } from './constants'
import type { Program } from '@babel/types'
import type { MagicString } from './magic-string'
import type {
  SFCDescriptor,
  SFCParseResult,
  SFCScriptBlock as SFCScriptBlockMixed,
} from '@vue/compiler-sfc'

export type SFCScriptBlock = Omit<
  SFCScriptBlockMixed,
  'scriptAst' | 'scriptSetupAst'
>

export type SFC = Omit<SFCDescriptor, 'script' | 'scriptSetup'> & {
  sfc: SFCParseResult
  script?: SFCScriptBlock | null
  scriptSetup?: SFCScriptBlock | null
  lang: string | undefined
  getScriptAst(): Program | undefined
  getSetupAst(): Program | undefined
} & Pick<SFCParseResult, 'errors'>

export function parseSFC(code: string, id: string): SFC {
  const sfc = parse(code, {
    filename: id,
  })
  const { descriptor, errors } = sfc
  const lang = (descriptor.script || descriptor.scriptSetup)?.lang

  return {
    sfc,
    ...descriptor,
    lang,
    errors,
    getSetupAst() {
      if (!descriptor.scriptSetup) return
      return babelParse(descriptor.scriptSetup.content, lang)
    },
    getScriptAst() {
      if (!descriptor.script) return
      return babelParse(descriptor.script.content, lang)
    },
  }
}

export function getFileCodeAndLang(
  code: string,
  id: string
): { code: string; lang: string } {
  if (!REGEX_VUE_SFC.test(id)) return { code, lang: getLang(id) }
  const sfc = parseSFC(code, id)
  const scriptCode = sfc.script?.content ?? ''
  return {
    code: sfc.scriptSetup
      ? `${scriptCode}\n;\n${sfc.scriptSetup.content}`
      : scriptCode,
    lang: sfc.lang ?? 'js',
  }
}

export function addNormalScript({ script, lang }: SFC, s: MagicString) {
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

const imported = new WeakMap<MagicString, Set<string>>()
export const HELPER_PREFIX = '__MACROS_'
export function importHelperFn(
  s: MagicString,
  offset: number,
  name: string,
  from: string
) {
  const cacheKey = `${from}@${name}`
  if (!imported.get(s)?.has(cacheKey)) {
    s.appendLeft(
      offset,
      `\nimport { ${name} as ${HELPER_PREFIX}${name} } from '${from}';`
    )
    if (!imported.has(s)) {
      imported.set(s, new Set([cacheKey]))
    } else {
      imported.get(s)!.add(cacheKey)
    }
  }
}
