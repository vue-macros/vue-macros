import {
  createFilter,
  DEFINE_MODELS,
  DEFINE_MODELS_DOLLAR,
} from '@vue-macros/common'
import { getText } from 'ts-macro'
import { addEmits, addProps, type VueMacrosPlugin } from './common'
import type { Code, Sfc } from '@vue/language-core'

function transformDefineModels(options: {
  codes: Code[]
  sfc: Sfc
  typeArg: import('typescript').TypeNode
  version: number
  ts: typeof import('typescript')
}) {
  const { codes, typeArg, version, ts, sfc } = options
  const ast = sfc.scriptSetup!.ast

  const propStrings: Code[] = []
  const emitStrings: Code[] = []

  if (ts.isTypeLiteralNode(typeArg) && typeArg.members) {
    for (const member of typeArg.members) {
      if (ts.isPropertySignature(member) && member.type) {
        const type = getText(member.type, ast, ts)
        const name = getText(member.name, ast, ts)
        emitStrings.push(`'update:${name}': [${name}: ${type}]`)

        propStrings.push(`${name}${member.questionToken ? '?' : ''}: ${type}`)
      }
    }
  }

  addProps(codes, propStrings, version)
  addEmits(codes, emitStrings, version)
}

function getTypeArg(ts: typeof import('typescript'), sfc: Sfc) {
  function getCallArg(node: import('typescript').Node) {
    if (
      !ts.isCallExpression(node) ||
      !ts.isIdentifier(node.expression) ||
      ![DEFINE_MODELS, DEFINE_MODELS_DOLLAR].includes(
        node.expression.escapedText!,
      ) ||
      node.typeArguments?.length !== 1
    )
      return undefined
    return node.typeArguments[0]
  }

  const sourceFile = sfc.scriptSetup!.ast
  return ts.forEachChild(sourceFile, (node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        return getCallArg(decl.initializer)
      })
    }
  })
}

const plugin: VueMacrosPlugin<'defineModels'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)
  const {
    modules: { typescript: ts },
    vueCompilerOptions: { target },
  } = ctx

  return {
    name: 'vue-macros-define-models',
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

      transformDefineModels({
        codes: embeddedFile.content,
        sfc,
        typeArg,
        version: target,
        ts,
      })
    },
  }
}
export default plugin
export { plugin as 'module.exports' }
