import { createFilter } from '@vue-macros/common'
import { replace } from 'muggle-string'
import { getVolarOptions } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'
import type ts from 'typescript'

type HasJSDoc = ts.HasJSDoc & { jsDoc: ts.JSDoc[] }

/**
 * Copy from https://github.com/microsoft/TypeScript/blob/5a97ce8281e2b4dce298c280b0e67ce049681d01/src/compiler/utilitiesPublic.ts#L2515
 *
 * GH#19856 Would like to return `node is Node & { jsDoc: JSDoc[] }` but it causes long compile times
 */
function hasJSDocNodes(node: ts.Node): node is HasJSDoc {
  if (!node) return false
  const { jsDoc } = node as ts.Node & {
    jsDoc: ts.JSDoc[]
  }
  return !!jsDoc && jsDoc.length > 0
}

function transform({
  codes,
  sfc,
  ts,
}: {
  codes: Code[]
  sfc: Sfc
  ts: typeof import('typescript')
}) {
  let jsDoc
  if (hasJSDocNodes(sfc.scriptSetup!.ast.statements[0])) {
    jsDoc = sfc.scriptSetup!.ast.statements[0].jsDoc.at(-1)
  }

  // With exportRender plugin.
  for (const stmt of sfc.scriptSetup!.ast.statements) {
    if (!ts.isExportAssignment(stmt)) continue

    if (hasJSDocNodes(stmt)) jsDoc ??= stmt.jsDoc.at(-1)
  }

  if (jsDoc) {
    replace(
      codes,
      /(?=export\sdefault)/,
      `${sfc.scriptSetup?.content.slice(jsDoc.pos, jsDoc.end)}\n`,
    )
  }
}

const plugin: VueLanguagePlugin = (ctx) => {
  const volarOptions = getVolarOptions(ctx, 'setupJsdoc')
  if (!volarOptions) return []

  const filter = createFilter(volarOptions)

  return {
    name: 'vue-macros-setup-jsdoc',
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
