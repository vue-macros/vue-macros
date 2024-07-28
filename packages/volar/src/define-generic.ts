import { createFilter } from '@vue-macros/common'
import { replace, replaceSourceRange } from 'muggle-string'
import { getText, getVolarOptions } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

function getDefineGenerics(
  ts: typeof import('typescript'),
  sfc: Sfc,
  codes: Code[],
) {
  const result: string[] = []
  const sourceFile = sfc.scriptSetup!.ast
  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isTypeAliasDeclaration(node) &&
      ts.isTypeReferenceNode(node.type) &&
      ts.isIdentifier(node.type.typeName) &&
      node.type.typeName.escapedText === 'DefineGeneric'
    ) {
      if (!node.type.typeArguments?.length) {
        replaceSourceRange(
          codes,
          'scriptSetup',
          node.name.pos,
          node.name.end,
          ` _${node.name.escapedText}`,
        )
        replaceSourceRange(
          codes,
          'scriptSetup',
          node.type.end,
          node.type.end,
          `<${node.name.escapedText}>`,
        )
      }

      const typeArgument = node.type.typeArguments?.[0]
        ? ` extends ${getText(node.type.typeArguments[0], { ts, sfc })}`
        : ''
      const defaultType = node.type.typeArguments?.[1]
        ? ` = ${getText(node.type.typeArguments[1], { ts, sfc })}`
        : ''
      result.push(`${node.name.escapedText}${typeArgument}${defaultType}`)
    }
  })

  return result
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions: { vueMacros },
}) => {
  const volarOptions = getVolarOptions(vueMacros, 'defineGeneric', false)
  if (!volarOptions) return []

  const filter = createFilter(volarOptions)

  return [
    {
      name: 'vue-macros-define-generic-pre',
      version: 2.1,
      order: -1,
      resolveEmbeddedCode(fileName, sfc) {
        if (
          filter(fileName) &&
          !sfc.scriptSetup?.attrs.generic &&
          sfc.scriptSetup?.content.includes('DefineGeneric')
        ) {
          sfc.scriptSetup!.attrs.generic = 'T'
        }
      },
    },
    {
      name: 'vue-macros-define-generic',
      version: 2.1,
      resolveEmbeddedCode(fileName, sfc, embeddedFile) {
        if (!filter(fileName) || !sfc.scriptSetup?.ast) return

        const defineGenerics = getDefineGenerics(ts, sfc, embeddedFile.content)
        if (!defineGenerics.length) return

        replace(
          embeddedFile.content,
          /(?<=export\sdefault\s\(<).*(?=,>)/,
          defineGenerics.join(', '),
        )
      },
    },
  ]
}

export default plugin
