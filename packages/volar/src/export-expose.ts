import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  allCodeFeatures,
  replace,
  replaceSourceRange,
} from '@vue/language-core'
import { createFilter } from '@rollup/pluginutils'
import { addCode, getStart, getVolarOptions } from './common'
import type { VolarOptions } from '..'

function transform(options: {
  fileName: string
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
  volarOptions: NonNullable<VolarOptions['exportExpose']>
}) {
  const { fileName, codes, sfc, ts, volarOptions } = options
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude,
  )
  if (!filter(fileName)) return

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
              propertyName.escapedText!,
              'scriptSetup',
              getStart(propertyName, options),
              allCodeFeatures,
            ],
            [
              name.escapedText!,
              'scriptSetup',
              getStart(name, options),
              allCodeFeatures,
            ],
          )

          exposed[name.escapedText!] = propertyName.escapedText!
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
            `(({`,
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
          `;[${stmt.exportClause.name.escapedText!}];`,
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
            const name = decl.name.escapedText!
            exposed[name] = name
          } else if (ts.isObjectBindingPattern(decl.name)) {
            decl.name.elements.forEach((element) => {
              if (!ts.isIdentifier(element.name)) return

              exposedValues.push(element.name.escapedText!)
              exposed[element.name.escapedText!] =
                element.propertyName && ts.isIdentifier(element.propertyName)
                  ? element.propertyName.escapedText!
                  : element.name.escapedText!
            })
          }
        }
      } else if (stmt.name && ts.isIdentifier(stmt.name)) {
        const name = stmt.name.escapedText!
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
      /(?<=export\sdefault \(await import\(\S+\)\)\.defineComponent\({[\S\s]*setup\(\) {\nreturn {\n)/,
      ...exposedStrings,
    )
  }
}

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions,
  modules: { typescript: ts },
}) => {
  return {
    name: 'vue-macros-export-expose',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!sfc.scriptSetup || !sfc.scriptSetup.ast) return

      transform({
        fileName,
        codes: embeddedFile.content,
        sfc,
        ts,
        volarOptions: getVolarOptions(vueCompilerOptions)?.exportExpose || {},
      })
    },
  }
}
export default plugin
