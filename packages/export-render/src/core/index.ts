import {
  type CodeTransform,
  MagicStringAST,
  generateTransform,
  parseSFC,
} from '@vue-macros/common'

export function transformExportRender(
  code: string,
  id: string,
): CodeTransform | undefined {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicStringAST(code)
  const nodes = getSetupAst()!.body
  const offset = scriptSetup.loc.start.offset

  let codegen = ''
  for (const stmt of nodes) {
    if (
      stmt.type === 'ExportDefaultDeclaration' &&
      stmt.exportKind === 'value'
    ) {
      codegen = s.sliceNode(stmt.declaration, { offset })
      s.removeNode(stmt, { offset })
    }
  }

  if (codegen.length === 0) return

  codegen = `defineRender(${codegen})`

  s.prependLeft(scriptSetup.loc.end.offset, `${codegen}\n`)

  return generateTransform(s, id)
}
