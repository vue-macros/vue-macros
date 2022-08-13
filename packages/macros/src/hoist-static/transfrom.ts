import { babelParse, isStaticExpression } from '@vue-macros/common'
import type { TransformContext } from '@vue-macros/common'
import type { Node } from '@babel/types'

export const transformHoistStatic = (ctx: TransformContext) => {
  function moveToScript(decl: Node, prefix: 'const ' | '' = '') {
    const text = s.slice(startOffset + decl.start!, startOffset + decl.end!)
    scriptCode.prepend += `\n${prefix}${text}`

    removeScriptSetup(decl.start!, decl.end!)
  }

  function removeScriptSetup(start: number, end: number) {
    s.remove(startOffset + start, startOffset + end)
    const { content } = scriptSetup!
    scriptSetup!.content = `${content.slice(0, start)}${' '.repeat(
      end - start
    )}${content.slice(end)}`
  }

  const { sfc, s, scriptCode } = ctx
  const { scriptSetup, lang } = sfc
  if (!scriptSetup) return

  const startOffset = scriptSetup.loc.start.offset
  const program = babelParse(scriptSetup.loc.source, lang)

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
          s.remove(startOffset + start, startOffset + end)
        }
      }
      if (count === decls.length) {
        removeScriptSetup(stmt.start!, stmt.end!)
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
}
