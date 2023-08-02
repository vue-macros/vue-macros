import {
  HELPER_PREFIX,
  MagicString,
  generateTransform,
  parseSFC,
} from '@vue-macros/common'
import { extractIdentifiers } from '@vue/compiler-sfc'

const MACROS_VAR_PREFIX = `${HELPER_PREFIX}expose_`

export function transformExportExpose(code: string, id: string) {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicString(code)
  const nodes = getSetupAst()!.body
  const offset = scriptSetup.loc.start.offset

  const exposed: Record<string, string> = Object.create(null)

  let i = 0
  for (const stmt of nodes) {
    const start = offset + stmt.start!
    const end = start + 6 /* 'export'.length */

    if (stmt.type === 'ExportNamedDeclaration' && stmt.exportKind === 'value') {
      if (stmt.declaration) {
        if (
          stmt.declaration.type === 'VariableDeclaration' &&
          !stmt.declaration.declare
        ) {
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

        s.remove(start, end)
      } else {
        for (const specifier of stmt.specifiers) {
          let exported: string, local: string
          if (specifier.type === 'ExportSpecifier') {
            if (specifier.exportKind === 'type') continue

            exported =
              specifier.exported.type === 'Identifier'
                ? specifier.exported.name
                : specifier.exported.value

            if (stmt.source) {
              // rename variable
              local = MACROS_VAR_PREFIX + String(i++)
              if (specifier.local.name === exported) {
                s.overwriteNode(
                  specifier.local,
                  `${specifier.local.name} as ${local}`,
                  { offset }
                )
              } else {
                s.overwriteNode(specifier.exported, local, { offset })
              }
            } else {
              local = specifier.local.name
            }
          } else if (specifier.type === 'ExportNamespaceSpecifier') {
            local = MACROS_VAR_PREFIX + String(i++)
            exported = specifier.exported.name

            s.overwriteNode(specifier.exported, local, { offset })
          } else continue

          exposed[exported] = local
        }

        if (stmt.source) {
          s.overwrite(start, end, 'import')
        } else {
          s.removeNode(stmt, { offset })
        }
      }
    } else if (
      stmt.type === 'ExportAllDeclaration' &&
      stmt.exportKind === 'value'
    ) {
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

  return generateTransform(s, id)
}
