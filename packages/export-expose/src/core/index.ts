import { MagicString, getTransformResult, parseSFC } from '@vue-macros/common'
import { extractIdentifiers } from '@vue/compiler-sfc'

export function transformExportExpose(code: string, id: string) {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicString(code)
  const nodes = getSetupAst()!.body
  const offset = scriptSetup.loc.start.offset

  const exposed: Record<string, string> = {}

  for (const stmt of nodes) {
    if (stmt.type === 'ExportNamedDeclaration' && stmt.exportKind === 'value') {
      if (stmt.source)
        throw new Error(
          'export from another module is not supported. Please import and export separately.'
        )

      if (stmt.declaration) {
        if (stmt.declaration.type === 'VariableDeclaration') {
          for (const decl of stmt.declaration.declarations) {
            for (const id of extractIdentifiers(decl.id)) {
              exposed[id.name] = id.name
            }
          }
        } else if (
          (stmt.declaration.type === 'FunctionDeclaration' ||
            stmt.declaration.type === 'ClassDeclaration' ||
            stmt.declaration.type === 'TSEnumDeclaration') &&
          !stmt.declaration.declare
        ) {
          exposed[stmt.declaration.id!.name] = stmt.declaration.id!.name
        }

        const start = offset + stmt.start!
        s.remove(start, start + 6 /* 'export'.length */)
      } else {
        for (const specifier of stmt.specifiers) {
          if (specifier.type === 'ExportDefaultSpecifier')
            throw new Error(
              'export from another module is not supported. Please import and export separately.'
            )
          else if (specifier.type === 'ExportNamespaceSpecifier') {
            throw new Error(
              'export from another module is not supported. Please import and export separately.'
            )
          }

          const exported =
            specifier.exported.type === 'Identifier'
              ? specifier.exported.name
              : specifier.exported.value
          const local = specifier.local.name
          exposed[exported] = local
        }

        s.removeNode(stmt, { offset })
      }
    } else if (stmt.type === 'ExportAllDeclaration') {
      throw new Error(
        'export from another module is not supported. Please import and export separately.'
      )
    } else if (stmt.type === 'ExportDefaultDeclaration') {
      throw new Error(
        'export default is not supported. Please use named export.'
      )
    }
  }

  if (Object.keys(exposed).length === 0) return

  let codegen = ''
  for (const [exported, local] of Object.entries(exposed)) {
    codegen += `\n  `
    if (exported === local) {
      codegen += `${exported},`
    } else {
      codegen += `${exported}: ${local},`
    }
  }
  codegen = `defineExpose({${codegen}\n})`

  s.prependLeft(scriptSetup.loc.end.offset, `${codegen}\n`)

  return getTransformResult(s, id)
}
