import {
  type CodeTransform,
  DEFINE_SLOTS,
  MagicStringAST,
  generateTransform,
  isCallOf,
  parseSFC,
} from '@vue-macros/common'

export function transformDefineSlots(
  code: string,
  id: string,
): CodeTransform | undefined {
  if (!code.includes(DEFINE_SLOTS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicStringAST(code)

  for (const stmt of getSetupAst()!.body) {
    if (
      stmt.type === 'ExpressionStatement' &&
      isCallOf(stmt.expression, DEFINE_SLOTS)
    ) {
      s.overwriteNode(stmt, '/*defineSlots*/', {
        offset: scriptSetup.loc.start.offset,
      })
    }
  }

  return generateTransform(s, id)
}
