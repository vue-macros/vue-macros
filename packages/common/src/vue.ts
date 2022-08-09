import { parse } from '@vue/compiler-sfc'
import type { MagicString, SFCDescriptor } from '@vue/compiler-sfc'

export const parseSFC = (code: string, id: string): SFCDescriptor => {
  const { descriptor } = parse(code, {
    filename: id,
  })
  return descriptor
}

export const appendToScript = (
  { script, scriptSetup }: SFCDescriptor,
  s: MagicString,
  content: string
) => {
  if (script) {
    s.appendRight(script.loc.end.offset, content)
  } else {
    const lang = scriptSetup?.attrs.lang
      ? ` lang="${scriptSetup.attrs.lang}"`
      : ''
    s.prepend(`<script${lang}>\n${content}</script>\n`)
  }
}
