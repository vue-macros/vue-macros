import {
  MagicString,
  addNormalScript,
  babelParse,
  getTransformResult,
  isStaticExpression,
  parseSFC,
} from '@vue-macros/common'
import type { Node } from '@babel/types'

export const transformHoistStatic = (code: string, id: string) => {
  function moveToScript(decl: Node, prefix: 'const ' | '' = '') {
    if (scriptOffset === undefined) scriptOffset = normalScript.start()

    const text = `\n${prefix}${s.sliceNode(decl, { offset: setupOffset })}`
    s.appendRight(scriptOffset, text)

    s.removeNode(decl, { offset: setupOffset })
  }

  const ctx = parseSFC(code, id)
  const { scriptSetup, lang } = ctx
  if (!scriptSetup) return

  const setupOffset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  // TODO use SWC
  const program = babelParse(scriptSetup.loc.source, lang)

  let normalScript = addNormalScript(ctx, s)
  let scriptOffset: number | undefined

  for (const stmt of program.body) {
    if (stmt.type === 'VariableDeclaration' && stmt.kind === 'const') {
      const decls = stmt.declarations
      let count = 0
      for (const [i, decl] of decls.entries()) {
        if (!decl.init || !isStaticExpression(decl.init)) continue

        count++
        moveToScript(decl, 'const ')

        // remove the comma
        if (decls.length > 1) {
          const isLast = i === decls.length - 1
          const start = isLast ? decls[i - 1].end! : decl.end!
          const end = isLast ? decl.start! : decls[i + 1].start!
          s.remove(setupOffset + start, setupOffset + end)
        }
      }
      if (count === decls.length) {
        s.removeNode(stmt, { offset: setupOffset })
      }
    } else if (stmt.type === 'TSEnumDeclaration') {
      const isAllConstant = stmt.members.every(
        (member) =>
          !member.initializer || isStaticExpression(member.initializer)
      )
      if (!isAllConstant) continue
      moveToScript(stmt)
    }
  }

  if (scriptOffset !== undefined) normalScript.end()

  return getTransformResult(s, id)
}
