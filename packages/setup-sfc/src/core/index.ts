import {
  MagicString,
  babelParse,
  generateTransform,
  getLang,
} from '@vue-macros/common'
import { type HmrContext } from 'vite'

export function transformSetupSFC(code: string, id: string) {
  const lang = getLang(id)
  const program = babelParse(code, lang)

  const s = new MagicString(code)
  for (const stmt of program.body) {
    if (stmt.type !== 'ExportDefaultDeclaration') continue
    s.append(`defineRender(${s.sliceNode(stmt.declaration)});`)
    s.removeNode(stmt)
  }

  const attrs = `${lang ? ` lang="${lang}"` : ''}`
  s.prepend(`<script setup${attrs}>`)
  s.append(`</script>`)

  return generateTransform(s, id)
}

export function hotUpdateSetupSFC(
  { modules }: HmrContext,
  filter: (id: unknown) => boolean
) {
  function isSubModule(id: string) {
    const [filename, query] = id.split('?')
    if (!query) return false
    if (!filter(filename)) return false
    return true
  }
  const affectedModules = modules.filter((mod) => mod.id && isSubModule(mod.id))
  return affectedModules
}
