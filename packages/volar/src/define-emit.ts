import { DEFINE_EMIT } from '@vue-macros/common'
import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  replace,
} from '@vue/language-core'
import { addEmits, getText } from './common'

function transformDefineModels(options: {
  codes: Code[]
  sfc: Sfc
  emitStrings: string[]
  vueLibName: string
  ts: typeof import('typescript')
}) {
  const { codes, emitStrings, vueLibName } = options

  replace(
    codes,
    /(?<=let __VLS_modelEmitsType!: {})/,
    ` & ReturnType<typeof import('${vueLibName}').defineEmits<{\n${emitStrings.join(',\n')}\n}>>`,
  )
  addEmits(codes, ['__VLS_NormalizeEmits<typeof __VLS_modelEmitsType>'])
}

function getEmitStrings(options: {
  ts: typeof import('typescript')
  sfc: Sfc
}) {
  const { ts, sfc } = options

  const emitStrings: string[] = []
  function walkNode(node: import('typescript').Node, defaultName = '') {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      DEFINE_EMIT === node.expression.text
    ) {
      const name =
        node.arguments.length && ts.isStringLiteral(node.arguments[0])
          ? node.arguments[0].text
          : defaultName
      if (!name) return

      const type =
        node.typeArguments?.length === 1
          ? ts.isFunctionTypeNode(node.typeArguments[0])
            ? `Parameters<${getText(node.typeArguments[0], options)}>`
            : getText(node.typeArguments[0], options)
          : '[]'
      emitStrings.push(`'${name}': ${type}`)
    }
  }

  const sourceFile = sfc.scriptSetup!.ast
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isExpressionStatement(node)) {
      walkNode(node.expression)
    } else if (ts.isVariableStatement(node)) {
      ts.forEachChild(node.declarationList, (decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          ts.isIdentifier(decl.name)
        ) {
          walkNode(decl.initializer, decl.name.text)
        }
      })
    }
  })

  return emitStrings
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-define-emit',
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (
        !['ts', 'tsx'].includes(embeddedFile.lang) ||
        !sfc.scriptSetup ||
        !sfc.scriptSetup.ast
      )
        return

      const emitStrings = getEmitStrings({ ts, sfc })
      if (!emitStrings.length) return

      const vueLibName = vueCompilerOptions.lib

      transformDefineModels({
        codes: embeddedFile.content,
        sfc,
        emitStrings,
        vueLibName,
        ts,
      })
    },
  }
}
export default plugin
