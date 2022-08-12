import type { TransformContext } from '@vue-macros/common'
import type { Node, Statement } from '@babel/types'

export const transformHoistStatic = (ctx: TransformContext) => {
  function moveToScript(decl: Node, prefix: 'const ' | '' = '') {
    const text = s.slice(startOffset + decl.start!, startOffset + decl.end!)
    s.remove(startOffset + decl.start!, startOffset + decl.end!)
    ctx.scriptCode.prepend += `\n${prefix}${text}`
  }

  const { sfc, s } = ctx
  if (!sfc.scriptSetup) return
  const startOffset = sfc.scriptSetup.loc.start.offset

  for (const stmt of sfc.scriptCompiled!.scriptSetupAst as Statement[]) {
    if (stmt.type === 'VariableDeclaration' && stmt.kind === 'const') {
      const decls = stmt.declarations
      let count = 0
      for (const [i, decl] of decls.entries()) {
        if (!decl.init || !isLiteral(decl.init)) continue

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
        s.remove(startOffset + stmt.start!, startOffset + stmt.end!)
      }
    } else if (stmt.type === 'TSEnumDeclaration') {
      const isAllConstant = stmt.members.every(
        (member) => !member.initializer || isLiteral(member.initializer)
      )
      if (!isAllConstant) continue
      moveToScript(stmt)
    }
  }
}

const isLiteral = (node: Node): boolean => {
  // magic comment
  if (
    node.leadingComments?.some(
      (comment) => comment.value.trim() === 'hoist-static'
    )
  ) {
    return true
  }

  switch (node.type) {
    case 'UnaryExpression': // !true
      return isLiteral(node.argument)
    case 'BinaryExpression': // 1 + 2
      return isLiteral(node.left) && isLiteral(node.right)
    case 'ArrayExpression': // [1, 2]
      return node.elements.every((element) => element && isLiteral(element))
    case 'ObjectExpression': // { foo: 1 }
      return node.properties.every(
        (prop) =>
          prop.type === 'ObjectProperty' &&
          (isLiteral(prop.key) ||
            (!prop.computed && prop.key.type === 'Identifier')) &&
          isLiteral(prop.value)
      )
    case 'SequenceExpression': // (1, 2)
    case 'TemplateLiteral': // `123`
      return node.expressions.every((expr) => isLiteral(expr))
  }

  if (isLiteralType(node)) return true
  return false
}

const isLiteralType = (node: Node) => node.type.endsWith('Literal')
