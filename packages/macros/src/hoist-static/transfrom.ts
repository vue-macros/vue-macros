import { babelParse } from '@vue-macros/common'
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
        removeScriptSetup(stmt.start!, stmt.end!)
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
  )
    return true

  switch (node.type) {
    case 'UnaryExpression': // !true
      return isLiteral(node.argument)
    case 'LogicalExpression': // 1 > 2
    case 'BinaryExpression': // 1 + 2
      return isLiteral(node.left) && isLiteral(node.right)

    case 'ConditionalExpression': // 1 ? 2 : 3
      return isLiteral(node.test)
        ? isLiteral(node.consequent)
        : isLiteral(node.alternate)

    case 'SequenceExpression': // (1, 2)
    case 'TemplateLiteral': // `123`
      return node.expressions.every((expr) => isLiteral(expr))

    case 'ArrayExpression': // [1, 2]
      return node.elements.every((element) => element && isLiteral(element))
    case 'ObjectExpression': // { foo: 1 }
      return node.properties.every(
        (prop) =>
          prop.type === 'ObjectProperty' &&
          (isLiteral(prop.key) || !prop.computed) &&
          isLiteral(prop.value)
      )

    case 'ParenthesizedExpression': // (1)
    case 'TSNonNullExpression': // 1!
    case 'TSAsExpression': // 1 as number
    case 'TSTypeAssertion': // (<number>2)
      return isLiteral(node.expression)
  }

  if (isLiteralType(node)) return true
  return false
}

const isLiteralType = (node: Node) => node.type.endsWith('Literal')
