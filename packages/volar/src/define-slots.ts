import { createFilter, DEFINE_SLOTS } from '@vue-macros/common'
import { replaceSourceRange } from 'muggle-string'
import type { VueMacrosPlugin } from './common'
import type { Code, Sfc } from '@vue/language-core'

function transform({
  codes,
  typeArg,
  vueVersion,
}: {
  codes: Code[]
  typeArg: import('typescript').TypeNode
  vueVersion: number
}) {
  replaceSourceRange(
    codes,
    'scriptSetup',
    typeArg.pos,
    typeArg.pos,
    '__VLS_DefineSlots<',
  )
  replaceSourceRange(codes, 'scriptSetup', typeArg.end, typeArg.end, '>')

  codes.push(
    `type __VLS_DefineSlots<T> = { [SlotName in keyof T]: T[SlotName] extends Function ? T[SlotName] : (_: T[SlotName]) => any };\n`,
  )

  if (vueVersion < 3) {
    codes.push(
      `declare function defineSlots<S extends Record<string, any> = Record<string, any>>(): S;\n`,
    )
  }
}

function getTypeArg(ts: typeof import('typescript'), sfc: Sfc) {
  function getCallArg(node: import('typescript').Node) {
    if (
      !ts.isCallExpression(node) ||
      !ts.isIdentifier(node.expression) ||
      node.expression.escapedText !== DEFINE_SLOTS ||
      node.typeArguments?.length !== 1
    )
      return undefined
    return node.typeArguments[0]
  }

  return ts.forEachChild(sfc.scriptSetup!.ast, (node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (ts.isVariableDeclaration(decl) && decl.initializer)
          return getCallArg(decl.initializer)
      })
    }
  })
}

const plugin: VueMacrosPlugin<'defineSlots'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)
  const {
    modules: { typescript: ts },
    vueCompilerOptions: { target },
  } = ctx

  return {
    name: 'vue-macros-define-slots',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (
        !filter(fileName) ||
        !['ts', 'tsx'].includes(embeddedFile.lang) ||
        !sfc.scriptSetup?.ast
      )
        return

      const typeArg = getTypeArg(ts, sfc)
      if (!typeArg) return

      transform({
        codes: embeddedFile.content,
        typeArg,
        vueVersion: target,
      })
    },
  }
}

export default plugin
