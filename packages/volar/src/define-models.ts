import { DEFINE_MODELS, DEFINE_MODELS_DOLLAR } from '@vue-macros/common'
import { addEmits, addProps, getText, getVolarOptions } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

function transformDefineModels(options: {
  codes: Code[]
  sfc: Sfc
  typeArg: import('typescript').TypeNode
  vueLibName: string
  unified: boolean
  ts: typeof import('typescript')
}) {
  const { codes, typeArg, unified, vueLibName, ts } = options

  const propStrings: Code[] = []
  const emitStrings: Code[] = []

  if (ts.isTypeLiteralNode(typeArg) && typeArg.members) {
    for (const member of typeArg.members) {
      if (ts.isPropertySignature(member) && member.type) {
        const type = getText(member.type, options)
        let name = getText(member.name, options)
        if (unified && name === 'modelValue') {
          name = 'value'
          emitStrings.push(`input: [value: ${type}]`)
        } else {
          emitStrings.push(`'update:${name}': [${name}: ${type}]`)
        }

        propStrings.push(`${name}${member.questionToken ? '?' : ''}: ${type}`)
      }
    }
  }

  addProps(codes, propStrings, vueLibName)
  addEmits(codes, emitStrings, vueLibName)
}

function getTypeArg(ts: typeof import('typescript'), sfc: Sfc) {
  function getCallArg(node: import('typescript').Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        [DEFINE_MODELS, DEFINE_MODELS_DOLLAR].includes(
          node.expression.escapedText!,
        ) &&
        node.typeArguments?.length === 1
      )
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

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-define-models',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (
        !['ts', 'tsx'].includes(embeddedFile.lang) ||
        !sfc.scriptSetup ||
        !sfc.scriptSetup.ast
      )
        return

      const typeArg = getTypeArg(ts, sfc)
      if (!typeArg) return

      const vueVersion = vueCompilerOptions.target
      const vueLibName = vueCompilerOptions.lib
      const volarOptions = getVolarOptions(vueCompilerOptions)
      const unified =
        vueVersion < 3 && (volarOptions?.defineModels?.unified ?? true)

      transformDefineModels({
        codes: embeddedFile.content,
        sfc,
        typeArg,
        vueLibName,
        unified,
        ts,
      })
    },
  }
}
export default plugin
