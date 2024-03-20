import {
  FileKind,
  FileRangeCapabilities,
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
  replaceAll,
  replaceSourceRange,
} from '@vue/language-core'
import { createFilter } from '@rollup/pluginutils'
import { getVolarOptions } from './common'
import type { VueEmbeddedFile } from '@vue/language-core/out/virtualFile/embeddedFile'
import type { VolarOptions } from '..'

function transform({
  fileName,
  file,
  sfc,
  ts,
  volarOptions,
}: {
  fileName: string
  file: VueEmbeddedFile
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
  volarOptions: NonNullable<VolarOptions['exportExpose']>
}) {
  const filter = createFilter(
    volarOptions.include || /.*/,
    volarOptions.exclude,
  )
  if (!filter(fileName)) return

  const exposed: Record<string, string> = Object.create(null)
  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause) {
      if (ts.isNamedExports(stmt.exportClause)) {
        const exportMap = new Map<
          Segment<FileRangeCapabilities>,
          Segment<FileRangeCapabilities>
        >()
        stmt.exportClause.elements.forEach((element) => {
          if (element.isTypeOnly) return

          const name = element.name
          const propertyName = element.propertyName || name

          exportMap.set(
            [
              propertyName.text,
              'scriptSetup',
              propertyName.getStart(sfc.scriptSetup?.ast),
              FileRangeCapabilities.full,
            ],
            [
              name.text,
              'scriptSetup',
              name.getStart(sfc.scriptSetup?.ast),
              FileRangeCapabilities.full,
            ],
          )

          exposed[name.text] = propertyName.text
        })

        if (stmt.moduleSpecifier) {
          const start = stmt.getStart(sfc.scriptSetup?.ast)
          const end = stmt.getEnd()

          replaceSourceRange(
            file.content,
            'scriptSetup',
            start,
            start + 6,
            'import',
          )
          replaceSourceRange(
            file.content,
            'scriptSetup',
            end,
            end,
            `;[${Array.from(exportMap.values()).map(([name]) => name)}];`,
          )
        } else {
          replaceSourceRange(
            file.content,
            'scriptSetup',
            stmt.getStart(sfc.scriptSetup?.ast),
            stmt.getEnd(),
            `(({`,
            ...Array.from(exportMap.entries()).flatMap(([name, value]) =>
              name[0] === value[0] ? [value, ','] : [name, ':', value, ','],
            ),
            `})=>{${Array.from(exportMap.values()).map(([name]) => name)}`,
            `})({${Array.from(exportMap.keys()).map(([name]) => name)}})`,
          )
        }
      } else if (ts.isNamespaceExport(stmt.exportClause)) {
        const start = stmt.getStart(sfc.scriptSetup?.ast)
        const end = stmt.getEnd()

        replaceSourceRange(
          file.content,
          'scriptSetup',
          start,
          start + 6,
          'import',
        )
        replaceSourceRange(
          file.content,
          'scriptSetup',
          end,
          end,
          `;[${stmt.exportClause.name.text}];`,
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
            const name = decl.name.text
            exposed[name] = name
          } else if (ts.isObjectBindingPattern(decl.name)) {
            decl.name.elements.forEach((element) => {
              if (!ts.isIdentifier(element.name)) return

              exposedValues.push(element.name.text)
              exposed[element.name.text] =
                element.propertyName && ts.isIdentifier(element.propertyName)
                  ? element.propertyName.text
                  : element.name.text
            })
          }
        }
      } else if (stmt.name && ts.isIdentifier(stmt.name)) {
        const name = stmt.name.text
        exposed[name] = name
      }

      replaceSourceRange(
        file.content,
        'scriptSetup',
        exportModifier.getStart(sfc.scriptSetup?.ast),
        exportModifier.getEnd(),
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

  replaceAll(
    file.content,
    /return {\n/g,
    'return {\n...{ ',
    ...exposedStrings,
    ' },\n',
  )
}

const plugin: VueLanguagePlugin = ({
  vueCompilerOptions,
  modules: { typescript: ts },
}) => {
  return {
    name: 'vue-macros-export-expose',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetup.ast
      )
        return

      transform({
        fileName,
        file: embeddedFile,
        sfc,
        ts,
        volarOptions: getVolarOptions(vueCompilerOptions)?.exportExpose || {},
      })
    },
  }
}
export default plugin
