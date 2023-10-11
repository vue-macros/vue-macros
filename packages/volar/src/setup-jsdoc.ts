import { FileKind } from '@volar/language-core'
import {
  type Sfc,
  type VueEmbeddedFile,
  type VueLanguagePlugin,
  replace,
} from '@vue/language-core'

/**
 * Copy from https://github.com/microsoft/TypeScript/blob/5a97ce8281e2b4dce298c280b0e67ce049681d01/src/compiler/utilitiesPublic.ts#L2515
 *
 * GH#19856 Would like to return `node is Node & { jsDoc: JSDoc[] }` but it causes long compile times
 */
function hasJSDocNodes(
  node: import('typescript/lib/tsserverlibrary').Node
): node is import('typescript/lib/tsserverlibrary').HasJSDoc & {
  jsDoc: import('typescript/lib/tsserverlibrary').JSDoc[]
} {
  if (!node) return false

  const { jsDoc } =
    node as import('typescript/lib/tsserverlibrary').JSDocContainer & {
      jsDoc: import('typescript/lib/tsserverlibrary').JSDoc[]
    }
  return !!jsDoc && jsDoc.length > 0
}

function transform({
  file,
  sfc,
  ts,
}: {
  file: VueEmbeddedFile
  sfc: Sfc
  ts: typeof import('typescript/lib/tsserverlibrary')
}) {
  let jsDoc
  if (hasJSDocNodes(sfc.scriptSetupAst!.statements[0])) {
    jsDoc = sfc.scriptSetupAst!.statements[0].jsDoc.at(-1)
  }

  // With exportRender plugin.
  for (const stmt of sfc.scriptSetupAst!.statements) {
    if (!ts.isExportAssignment(stmt)) continue

    if (hasJSDocNodes(stmt)) jsDoc ??= stmt.jsDoc.at(-1)
  }

  if (jsDoc) {
    replace(
      file.content,
      /(?=export\sdefault)/,
      `${sfc.scriptSetup?.content.slice(jsDoc.pos, jsDoc.end)}\n`
    )
  }
}

const plugin: VueLanguagePlugin = ({ modules: { typescript: ts } }) => {
  return {
    name: 'vue-macros-setup-jsdoc',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetupAst
      )
        return

      transform({
        file: embeddedFile,
        sfc,
        ts,
      })
    },
  }
}
export default plugin
