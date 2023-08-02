import { type Program } from '@babel/types'
import {
  MagicString,
  REGEX_SETUP_SFC,
  babelParse,
  generateTransform,
  getLang,
  parseSFC,
} from '@vue-macros/common'
import { vIfTransform } from './v-if'
import { vForTransform } from './v-for'

export function transformJsxDirective(code: string, id: string) {
  const lang = getLang(id)
  let asts: {
    ast: Program
    offset: number
  }[] = []
  if (lang === 'vue' || REGEX_SETUP_SFC.test(id)) {
    const { scriptSetup, getSetupAst, script, getScriptAst } = parseSFC(
      code,
      id
    )
    if (script) {
      asts.push({ ast: getScriptAst()!, offset: script.loc.start.offset })
    }
    if (scriptSetup) {
      asts.push({ ast: getSetupAst()!, offset: scriptSetup.loc.start.offset })
    }
  } else if (['jsx', 'tsx'].includes(lang)) {
    asts = [{ ast: babelParse(code, lang), offset: 0 }]
  } else {
    return
  }

  const s = new MagicString(code)
  for (const { ast, offset } of asts) {
    vIfTransform(ast, s, offset)
    vForTransform(ast, s, offset)
  }

  return generateTransform(s, id)
}
