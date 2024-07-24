import {
  generateTransform,
  MagicString,
  parseSFC,
  type CodeTransform,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'

export function transformScriptLang(
  code: string,
  id: string,
  options: OptionsResolved,
): CodeTransform | undefined {
  const s = new MagicString(code)
  const lang = ` lang="${options?.defaultLang || 'ts'}"`

  const {
    sfc: {
      descriptor: { script, scriptSetup },
    },
  } = parseSFC(code, id)

  if (script && !script.attrs.lang) {
    const start = script.loc.start.offset
    s.appendLeft(start - 1, lang)
  }
  if (scriptSetup && !scriptSetup.attrs.lang) {
    const start = scriptSetup.loc.start.offset
    s.appendLeft(start - 1, lang)
  }

  return generateTransform(s, id)
}
