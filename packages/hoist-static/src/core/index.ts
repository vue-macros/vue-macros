import {
  MagicString,
  addNormalScript,
  generateTransform,
  isStaticExpression,
  parseSFC,
} from '@vue-macros/common'
import { type Node } from '@babel/types'

export const MAGIC_COMMENT = 'hoist-static'

export function transformHoistStatic(code: string, id: string) {
  function moveToScript(decl: Node, prefix: 'const ' | '' = '') {
    if (scriptOffset === undefined) scriptOffset = normalScript.start()

    const text = `\n${prefix}${s.sliceNode(decl, { offset: setupOffset })}`
    s.appendRight(scriptOffset, text)

    s.removeNode(decl, { offset: setupOffset })
  }

  const sfc = parseSFC(code, id)
  const { scriptSetup, getSetupAst } = sfc
  if (!scriptSetup) return

  const setupOffset = scriptSetup.loc.start.offset
  const setupOffsetEnd = scriptSetup.loc.end.offset
  const s = new MagicString(code)
  const program = getSetupAst()!

  let normalScript = addNormalScript(sfc, s)
  let scriptOffset: number | undefined

  for (const stmt of program.body) {
    if (stmt.type === 'VariableDeclaration' && stmt.kind === 'const') {
      const decls = stmt.declarations
      let count = 0
      for (const [i, decl] of decls.entries()) {
        if (
          !decl.init ||
          !isStaticExpression(decl.init, {
            unary: true,
            magicComment: MAGIC_COMMENT,
          })
        )
          continue

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
          !member.initializer ||
          isStaticExpression(member.initializer, {
            unary: true,
            magicComment: MAGIC_COMMENT,
          })
      )
      if (!isAllConstant) continue
      moveToScript(stmt)
    }
  }

  const restSetup = s.slice(setupOffset, setupOffsetEnd)
  if (restSetup.trim().length === 0) {
    s.appendLeft(setupOffsetEnd, '/* hoist static placeholder */')
  }

  if (scriptOffset !== undefined) normalScript.end()

  return generateTransform(s, id)
}
