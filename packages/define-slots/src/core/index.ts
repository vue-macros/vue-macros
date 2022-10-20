import {
  DEFINE_SLOTS,
  MagicString,
  getTransformResult,
  isCallOf,
  parseSFC,
} from '@vue-macros/common'

export const transfromDefineSlots = (code: string, id: string) => {
  if (!code.includes(DEFINE_SLOTS)) return

  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup || !sfc.scriptCompiled.scriptSetupAst) return

  const { scriptSetupAst } = sfc.scriptCompiled
  const s = new MagicString(code)

  for (const stmt of scriptSetupAst) {
    if (
      stmt.type === 'ExpressionStatement' &&
      isCallOf(stmt.expression, DEFINE_SLOTS)
    ) {
      s.overwriteNode(stmt, '/*defineSlots*/', {
        offset: sfc.scriptSetup.loc.start.offset,
      })
    }
  }

  return getTransformResult(s, id)
}
