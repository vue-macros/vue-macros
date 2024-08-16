import { createFilter } from '@vue-macros/common'
import { allCodeFeatures, type Code, type Sfc } from '@vue/language-core'
import { replace, replaceSourceRange } from 'muggle-string'
import { addCode, getStart, getText, type VueMacrosPlugin } from './common'

function transform(options: {
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
}) {
  const { codes, sfc, ts } = options

  const exposed: Record<string, string> = Object.create(null)
  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause) {
      const start = getStart(stmt, options)
      const end = stmt.end

      if (ts.isNamedExports(stmt.exportClause)) {
        const exportMap = new Map<Code, Code>()
        stmt.exportClause.elements.forEach((element) => {
          if (element.isTypeOnly) return

          const name = element.name
          const propertyName = element.propertyName || name

          exportMap.set(
            [
              getText(propertyName, options),
              'scriptSetup',
              getStart(propertyName, options),
              allCodeFeatures,
            ],
            [
              getText(name, options),
              'scriptSetup',
              getStart(name, options),
              allCodeFeatures,
            ],
          )

          exposed[getText(name, options)] = getText(propertyName, options)
        })

        if (stmt.moduleSpecifier) {
          replaceSourceRange(codes, 'scriptSetup', start, start + 6, 'import')
          replaceSourceRange(
            codes,
            'scriptSetup',
            end,
            end,
            `;[${Array.from(exportMap.values()).map(([name]) => name)}];`,
          )
        } else {
          replaceSourceRange(
            codes,
            'scriptSetup',
            start,
            end,
            `;(({`,
            ...Array.from(exportMap.entries()).flatMap(([name, value]) =>
              name[0] === value[0] ? [value, ','] : [name, ':', value, ','],
            ),
            `})=>{${Array.from(exportMap.values()).map(([name]) => name)}`,
            `})({${Array.from(exportMap.keys()).map(([name]) => name)}})`,
          )
        }
      } else if (ts.isNamespaceExport(stmt.exportClause)) {
        replaceSourceRange(codes, 'scriptSetup', start, start + 6, 'import')
        replaceSourceRange(
          codes,
          'scriptSetup',
          end,
          end,
          `;[${getText(stmt.exportClause.name, options)}];`,
        )
      }
    } else if (
      ts.isVariableStatement(stmt) ||
      ts.isFunctionDeclaration(stmt) ||
      ts.isClassDeclaration(stmt)
    ) {
      const exportModifier = stmt.modifiers?.find(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      )
      if (!exportModifier) continue

      const exposedValues: string[] = []
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (!decl.name) continue

          if (ts.isIdentifier(decl.name)) {
            const name = getText(decl.name, options)
            exposed[name] = name
          } else if (ts.isObjectBindingPattern(decl.name)) {
            decl.name.elements.forEach((element) => {
              if (!ts.isIdentifier(element.name)) return

              exposedValues.push(getText(element.name, options))
              exposed[getText(element.name, options)] =
                element.propertyName && ts.isIdentifier(element.propertyName)
                  ? getText(element.propertyName, options)
                  : getText(element.name, options)
            })
          }
        }
      } else if (stmt.name && ts.isIdentifier(stmt.name)) {
        const name = getText(stmt.name, options)
        exposed[name] = name
      }

      replaceSourceRange(
        codes,
        'scriptSetup',
        getStart(exportModifier, options),
        exportModifier.end,
        exposedValues.length > 0 ? `[${exposedValues}];` : '',
      )
    }
  }

  if (Object.keys(exposed).length === 0) return

  const exposedStrings = Object.entries(exposed).flatMap(([key, value]) => [
    `${key}: `,
    value,
    ',\n',
  ])

  if (sfc.scriptSetup?.generic) {
    addCode(codes, `const __VLS_exportExposed = {\n`, ...exposedStrings, `};\n`)

    replace(
      codes,
      /(?<=expose\(exposed: import\(\S+\)\.ShallowUnwrapRef<)/,
      'typeof __VLS_exportExposed & ',
    )
  } else {
    replace(
      codes,
      /(?<=export\sdefault \(await import\(\S+\)\)\.defineComponent\(\{[\s\S]*setup\(\) \{\nreturn \{\n)/,
      ...exposedStrings,
    )
  }
}

const plugin: VueMacrosPlugin<'exportExpose'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    name: 'vue-macros-export-expose',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !sfc.scriptSetup?.ast) return

      transform({
        codes: embeddedFile.content,
        sfc,
        ts: ctx.modules.typescript,
      })
    },
  }
}
export default plugin
