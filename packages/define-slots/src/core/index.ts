import {
  DEFINE_SLOTS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
} from '@vue-macros/common'

export function transfromDefineSlots(code: string, id: string) {
  if (!code.includes(DEFINE_SLOTS)) return

  const { scriptSetup, setupAst } = parseSFC(code, id)
  if (!scriptSetup || !setupAst) return

  const s = new MagicString(code)

  for (const stmt of setupAst.body) {
    if (
      stmt.type === 'ExpressionStatement' &&
      isCallOf(stmt.expression, DEFINE_SLOTS)
    ) {
      s.overwriteNode(stmt, '/*defineSlots*/', {
        offset: scriptSetup.loc.start.offset,
      })
    }
  }

  return getTransformResult(s, id)
}
